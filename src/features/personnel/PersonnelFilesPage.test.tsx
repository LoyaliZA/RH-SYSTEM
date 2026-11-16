import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanies, setActiveCompany } from "@/features/companies/api";
import { CompanyProvider, useCompanies } from "@/features/companies/company-context";
import type { Company } from "@/features/companies/types";

import { createPersonnelFile, listPersonnelFiles } from "./api";
import { PersonnelFilesPage } from "./PersonnelFilesPage";
import type { PersonnelFile, PersonnelFileInput } from "./types";

vi.mock("@/features/companies/api", () => ({
  listCompanies: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  setActiveCompany: vi.fn(),
}));

vi.mock("./api", () => ({
  listPersonnelFiles: vi.fn(),
  getPersonnelFile: vi.fn(),
  createPersonnelFile: vi.fn(),
  updatePersonnelFile: vi.fn(),
}));

const norte: Company = {
  id: "company-1",
  legalName: "Taller Norte",
  tradeName: "Norte",
  taxId: "DEMO-0001",
  displayName: "Norte",
  isActive: true,
  createdAt: "2026-11-14T20:00:00Z",
  updatedAt: "2026-11-14T20:00:00Z",
};

const sur: Company = {
  ...norte,
  id: "company-2",
  legalName: "Estudio Sur",
  tradeName: null,
  taxId: null,
  displayName: "Estudio Sur",
  isActive: false,
};

const alex: PersonnelFile = {
  id: "file-1",
  personId: "person-1",
  companyId: "company-1",
  companyName: "Norte",
  employeeNumber: "TN-001",
  givenName: "Alex",
  familyName: "Rivera",
  administrativeStatus: "active",
  createdAt: "2026-11-16T00:00:00Z",
  updatedAt: "2026-11-16T00:00:00Z",
};

const pat: PersonnelFile = {
  ...alex,
  id: "file-2",
  personId: "person-2",
  companyId: "company-2",
  companyName: "Estudio Sur",
  employeeNumber: "ES-010",
  givenName: "Pat",
  familyName: "Gómez",
  administrativeStatus: "inactive",
};

function SwitchCompanyButton() {
  const { activate } = useCompanies();
  return (
    <button type="button" onClick={() => void activate("company-2")}>
      Cambiar a Estudio Sur
    </button>
  );
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/files"]}>
      <CompanyProvider>
        <SwitchCompanyButton />
        <Routes>
          <Route path="/files" element={<PersonnelFilesPage />} />
          <Route path="/files/:fileId" element={<p>Detalle</p>} />
          <Route path="/companies" element={<p>Empresas</p>} />
        </Routes>
      </CompanyProvider>
    </MemoryRouter>,
  );
}

describe("PersonnelFilesPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listCompanies).mockResolvedValue([norte, sur]);
    vi.mocked(listPersonnelFiles).mockResolvedValue([alex]);
    vi.mocked(createPersonnelFile).mockImplementation(
      async (input: PersonnelFileInput) => ({
        ...alex,
        id: "file-new",
        personId: "person-new",
        givenName: input.givenName,
        familyName: input.familyName,
        employeeNumber: input.employeeNumber,
        administrativeStatus: input.administrativeStatus,
      }),
    );
    vi.mocked(setActiveCompany).mockResolvedValue({ ...sur, isActive: true });
  });

  it("lists files and can open the detail", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Expedientes" }),
    ).toBeInTheDocument();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("TN-001")).toBeInTheDocument();
    expect(within(table).getByText("Alex")).toBeInTheDocument();
    expect(within(table).getByText("Rivera")).toBeInTheDocument();
    expect(within(table).getByText("Activo")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar expedientes")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Consultar" }));
    expect(screen.getByText("Detalle")).toBeInTheDocument();
  });

  it("searches through the command and shows an empty result", async () => {
    const user = userEvent.setup();
    vi.mocked(listPersonnelFiles)
      .mockResolvedValueOnce([alex])
      .mockResolvedValueOnce([]);
    renderPage();
    await screen.findByText("TN-001");

    await user.type(screen.getByLabelText("Buscar expedientes"), "sin-coincidencia");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByText("Sin resultados")).toBeInTheDocument();
    await waitFor(() => {
      expect(listPersonnelFiles).toHaveBeenLastCalledWith("sin-coincidencia");
    });
  });

  it("creates a synthetic file from the side panel", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("TN-001");

    await user.click(screen.getByRole("button", { name: "Nuevo expediente" }));
    await user.type(screen.getByRole("textbox", { name: /nombre/i }), "Sam");
    await user.type(screen.getByRole("textbox", { name: /apellidos/i }), "Ortega");
    await user.type(
      screen.getByRole("textbox", { name: /número de empleado/i }),
      "TN-002",
    );
    await user.click(screen.getByRole("button", { name: "Crear expediente" }));

    await waitFor(() => {
      expect(createPersonnelFile).toHaveBeenCalledWith({
        givenName: "Sam",
        familyName: "Ortega",
        employeeNumber: "TN-002",
        administrativeStatus: "active",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Se creó el expediente.",
    );
  });

  it("reloads files when the active company changes", async () => {
    const user = userEvent.setup();
    vi.mocked(listCompanies)
      .mockResolvedValueOnce([norte, sur])
      .mockResolvedValueOnce([
        { ...norte, isActive: false },
        { ...sur, isActive: true },
      ]);
    vi.mocked(listPersonnelFiles)
      .mockResolvedValueOnce([alex])
      .mockResolvedValueOnce([pat]);
    renderPage();
    await screen.findByText("TN-001");

    await user.click(screen.getByRole("button", { name: "Cambiar a Estudio Sur" }));

    expect(await screen.findByText("ES-010")).toBeInTheDocument();
    expect(screen.queryByText("TN-001")).not.toBeInTheDocument();
  });

  it("shows an empty state when there is no company", async () => {
    vi.mocked(listCompanies).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No hay empresa activa")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a empresas" })).toHaveAttribute(
      "href",
      "/companies",
    );
    expect(listPersonnelFiles).not.toHaveBeenCalled();
  });
});
