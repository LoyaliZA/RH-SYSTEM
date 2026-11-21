import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanies } from "@/features/companies/api";
import { CompanyProvider } from "@/features/companies/company-context";
import type { Company } from "@/features/companies/types";

import {
  createEmploymentRelationship,
  getEmploymentForFile,
} from "@/features/employment/api";
import type { EmploymentRelationship } from "@/features/employment/types";
import { listJobs } from "@/features/jobs/api";
import type { Job } from "@/features/jobs/types";

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

vi.mock("@/features/jobs/api", () => ({
  listJobs: vi.fn(),
  getJob: vi.fn(),
  createJob: vi.fn(),
  updateJob: vi.fn(),
  setJobStatus: vi.fn(),
}));

vi.mock("@/features/employment/api", () => ({
  getEmploymentForFile: vi.fn(),
  createEmploymentRelationship: vi.fn(),
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

const relationship: EmploymentRelationship = {
  id: "rel-1",
  companyId: "company-1",
  companyName: "Norte",
  personnelFileId: "file-1",
  startedOn: "2026-11-16",
  endedOn: null,
  state: "open",
  assignmentId: "asg-1",
  jobId: "job-1",
  jobCode: "OP-01",
  jobName: "Operación de piso",
  jobStatus: "active",
  effectiveOn: "2026-11-16",
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
    vi.mocked(getEmploymentForFile).mockResolvedValue(null);
    vi.mocked(listJobs).mockResolvedValue([operation]);
    vi.mocked(createEmploymentRelationship).mockResolvedValue(relationship);
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

  it("shows an empty employment state and can register the initial relationship", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("Sin relación laboral")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Registrar relación inicial" }),
    );
    await user.type(screen.getByLabelText("Fecha de inicio"), "2026-11-16");
    await user.selectOptions(screen.getByLabelText("Puesto"), "job-1");
    await user.click(screen.getByRole("button", { name: "Registrar relación" }));

    await waitFor(() => {
      expect(createEmploymentRelationship).toHaveBeenCalledWith({
        personnelFileId: "file-1",
        jobId: "job-1",
        startedOn: "2026-11-16",
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Se registró la relación laboral.",
    );
  });

  it("shows the linked job and start date without a salary history", async () => {
    vi.mocked(getEmploymentForFile).mockResolvedValue(relationship);
    renderPage();

    expect(await screen.findByText("16 de noviembre de 2026")).toBeInTheDocument();
    expect(screen.getByText("Operación de piso")).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.getByText("rel-1")).toBeInTheDocument();
    expect(
      screen.getByText(/no hay historial de puestos, salarios/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Sin relación laboral")).not.toBeInTheDocument();
  });
});
