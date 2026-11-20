import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanies, setActiveCompany } from "@/features/companies/api";
import { CompanyProvider, useCompanies } from "@/features/companies/company-context";
import type { Company } from "@/features/companies/types";

import { createJob, listJobs, setJobStatus, updateJob } from "./api";
import { JobsPage } from "./JobsPage";
import type { Job, JobInput, JobStatus } from "./types";

vi.mock("@/features/companies/api", () => ({
  listCompanies: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  setActiveCompany: vi.fn(),
}));

vi.mock("./api", () => ({
  listJobs: vi.fn(),
  getJob: vi.fn(),
  createJob: vi.fn(),
  updateJob: vi.fn(),
  setJobStatus: vi.fn(),
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

const operation: Job = {
  id: "job-1",
  companyId: "company-1",
  companyName: "Norte",
  code: "OP-01",
  name: "Operación de piso",
  description: null,
  status: "active",
  createdAt: "2026-11-16T00:00:00Z",
  updatedAt: "2026-11-16T00:00:00Z",
};

const southJob: Job = {
  ...operation,
  id: "job-2",
  companyId: "company-2",
  companyName: "Estudio Sur",
  code: "OP-01",
  name: "Operación sur",
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
    <MemoryRouter initialEntries={["/jobs"]}>
      <CompanyProvider>
        <SwitchCompanyButton />
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/companies" element={<p>Empresas</p>} />
        </Routes>
      </CompanyProvider>
    </MemoryRouter>,
  );
}

describe("JobsPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listCompanies).mockResolvedValue([norte, sur]);
    vi.mocked(listJobs).mockResolvedValue([operation]);
    vi.mocked(createJob).mockImplementation(async (input: JobInput) => ({
      ...operation,
      id: "job-new",
      code: input.code,
      name: input.name,
      description: input.description,
    }));
    vi.mocked(updateJob).mockImplementation(async (id: string, input: JobInput) => ({
      ...operation,
      id,
      code: input.code,
      name: input.name,
      description: input.description,
    }));
    vi.mocked(setJobStatus).mockImplementation(
      async (id: string, status: JobStatus) => ({
        ...operation,
        id,
        status,
      }),
    );
    vi.mocked(setActiveCompany).mockResolvedValue({ ...sur, isActive: true });
  });

  it("lists code, name and status for the active company", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Puestos" })).toBeInTheDocument();
    const table = await screen.findByRole("table");
    expect(within(table).getByText("OP-01")).toBeInTheDocument();
    expect(within(table).getByText("Operación de piso")).toBeInTheDocument();
    expect(within(table).getByText("Activo")).toBeInTheDocument();
  });

  it("creates and edits a job from the side panel", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("OP-01");

    await user.click(screen.getByRole("button", { name: "Nuevo puesto" }));
    await user.type(screen.getByRole("textbox", { name: /código/i }), "OP-02");
    await user.type(
      screen.getByRole("textbox", { name: /nombre del puesto/i }),
      "Recepción",
    );
    await user.click(screen.getByRole("button", { name: "Crear puesto" }));

    await waitFor(() => {
      expect(createJob).toHaveBeenCalledWith({
        code: "OP-02",
        name: "Recepción",
        description: null,
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Se creó el puesto.");

    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByRole("textbox", { name: /nombre del puesto/i }));
    await user.type(
      screen.getByRole("textbox", { name: /nombre del puesto/i }),
      "Operación revisada",
    );
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateJob).toHaveBeenCalledWith("job-1", {
        code: "OP-01",
        name: "Operación revisada",
        description: null,
      });
    });
  });

  it("asks before deactivating and reloads after the company changes", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(listCompanies)
      .mockResolvedValueOnce([norte, sur])
      .mockResolvedValueOnce([
        { ...norte, isActive: false },
        { ...sur, isActive: true },
      ]);
    vi.mocked(listJobs)
      .mockResolvedValueOnce([operation])
      .mockResolvedValueOnce([{ ...operation, status: "inactive" }])
      .mockResolvedValueOnce([southJob]);
    renderPage();
    await screen.findByText("Operación de piso");

    await user.click(screen.getByRole("button", { name: "Desactivar" }));
    expect(confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(setJobStatus).toHaveBeenCalledWith("job-1", "inactive");
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Se desactivó el puesto.",
    );

    await user.click(screen.getByRole("button", { name: "Cambiar a Estudio Sur" }));
    expect(await screen.findByText("Operación sur")).toBeInTheDocument();
    expect(screen.queryByText("Operación de piso")).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it("shows an empty state when there is no company", async () => {
    vi.mocked(listCompanies).mockResolvedValue([]);
    renderPage();

    expect(await screen.findByText("No hay empresa activa")).toBeInTheDocument();
    expect(listJobs).not.toHaveBeenCalled();
  });
});
