import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listCompanies, setActiveCompany } from "../companies/api";
import { CompanyProvider } from "../companies/company-context";
import type { Company } from "../companies/types";
import { DashboardPage } from "./DashboardPage";

vi.mock("../companies/api", () => ({
  listCompanies: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  setActiveCompany: vi.fn(),
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

function renderDashboard() {
  return render(
    <MemoryRouter>
      <CompanyProvider>
        <DashboardPage />
      </CompanyProvider>
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("offers a company selector and does not invent indicators", async () => {
    vi.mocked(listCompanies).mockResolvedValue([norte, sur]);
    renderDashboard();

    const selector = await screen.findByRole("combobox", { name: "Elegir empresa" });
    expect(selector).toHaveValue("company-1");
    expect(screen.getByText("DEMO-0001")).toBeInTheDocument();
    expect(screen.getByText(/No se muestran cifras de ejemplo/)).toBeInTheDocument();
    expect(screen.queryByText(/\d+\s+empleados/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Vacaciones/ })).toHaveAttribute(
      "href",
      "/modules/vacations",
    );
  });

  it("activates the company chosen in the selector", async () => {
    const user = userEvent.setup();
    vi.mocked(listCompanies).mockResolvedValue([norte, sur]);
    vi.mocked(setActiveCompany).mockResolvedValue({ ...sur, isActive: true });
    renderDashboard();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Elegir empresa" }),
      "company-2",
    );
    expect(setActiveCompany).toHaveBeenCalledWith("company-2");
  });

  it("points to companies when none exist", async () => {
    vi.mocked(listCompanies).mockResolvedValue([]);
    renderDashboard();

    expect(await screen.findByText("Sin empresa activa.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a empresas" })).toHaveAttribute(
      "href",
      "/companies",
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
