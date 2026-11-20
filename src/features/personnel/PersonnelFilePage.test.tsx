import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanies } from "@/features/companies/api";
import { CompanyProvider } from "@/features/companies/company-context";
import type { Company } from "@/features/companies/types";

import { getPersonnelFile, updatePersonnelFile } from "./api";
import { PersonnelFilePage } from "./PersonnelFilePage";
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

const stored: PersonnelFile = {
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/files/file-1"]}>
      <CompanyProvider>
        <Routes>
          <Route path="/files/:fileId" element={<PersonnelFilePage />} />
          <Route path="/files" element={<p>Listado</p>} />
        </Routes>
      </CompanyProvider>
    </MemoryRouter>,
  );
}

describe("PersonnelFilePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listCompanies).mockResolvedValue([norte]);
    vi.mocked(getPersonnelFile).mockResolvedValue(stored);
    vi.mocked(updatePersonnelFile).mockImplementation(
      async (_id: string, input: PersonnelFileInput) => ({
        ...stored,
        ...input,
        updatedAt: "2026-11-16T01:00:00Z",
      }),
    );
  });

  it("shows the file, company, internal ids and can save an edit", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByDisplayValue("Alex")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rivera")).toBeInTheDocument();
    expect(screen.getByDisplayValue("TN-001")).toBeInTheDocument();
    expect(screen.getByText("file-1")).toBeInTheDocument();
    expect(screen.getByText("person-1")).toBeInTheDocument();
    expect(screen.getByText("Norte")).toBeInTheDocument();
    expect(
      screen.getByText(/salarios, contratos, documentos sensibles/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled();

    await user.clear(screen.getByRole("textbox", { name: /apellidos/i }));
    await user.type(screen.getByRole("textbox", { name: /apellidos/i }), "Rivera Soto");
    expect(screen.getByText("Hay cambios sin guardar.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updatePersonnelFile).toHaveBeenCalledWith("file-1", {
        givenName: "Alex",
        familyName: "Rivera Soto",
        employeeNumber: "TN-001",
        administrativeStatus: "active",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Se guardaron los cambios.",
    );
  });

  it("keeps the operator in the file when a validation error is returned", async () => {
    const user = userEvent.setup();
    vi.mocked(updatePersonnelFile).mockRejectedValue({
      code: "duplicate_employee_number",
      message:
        "Ya existe un expediente con ese número de empleado en la empresa activa.",
    });
    renderPage();
    await screen.findByDisplayValue("TN-001");

    await user.clear(screen.getByRole("textbox", { name: /número de empleado/i }));
    await user.type(
      screen.getByRole("textbox", { name: /número de empleado/i }),
      "TN-009",
    );
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(
      await screen.findByText(
        "Ya existe un expediente con ese número de empleado en la empresa activa.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /número de empleado/i }),
    ).toHaveAttribute("aria-invalid", "true");
  });
});
