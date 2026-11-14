import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CompaniesPage } from "./CompaniesPage";
import { listCompanies, updateCompany } from "./api";
import { CompanyProvider } from "./company-context";
import type { Company, CompanyInput } from "./types";

vi.mock("./api", () => ({
  listCompanies: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  setActiveCompany: vi.fn(),
}));

const stored: Company = {
  id: "company-1",
  legalName: "Taller Norte",
  tradeName: "Norte",
  taxId: "DEMO-0001",
  displayName: "Norte",
  isActive: true,
  createdAt: "2026-11-14T20:00:00Z",
  updatedAt: "2026-11-14T20:00:00Z",
};

function renderPage() {
  return render(
    <CompanyProvider>
      <CompaniesPage />
    </CompanyProvider>,
  );
}

describe("CompaniesPage edit", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listCompanies).mockResolvedValue([stored]);
    vi.mocked(updateCompany).mockImplementation(
      async (_id: string, input: CompanyInput) => ({
        ...stored,
        legalName: input.legalName,
        tradeName: input.tradeName,
        taxId: input.taxId,
        displayName: input.tradeName ?? input.legalName,
        updatedAt: "2026-11-14T20:05:00Z",
      }),
    );
  });

  it("prefills every stored field and keeps the optional values when only the legal name changes", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("DEMO-0001")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    const legalName = screen.getByRole("textbox", { name: /razón social/i });
    const tradeName = screen.getByRole("textbox", { name: /nombre comercial/i });
    const taxId = screen.getByRole("textbox", { name: /identificador fiscal/i });
    expect(legalName).toHaveValue("Taller Norte");
    expect(tradeName).toHaveValue("Norte");
    expect(taxId).toHaveValue("DEMO-0001");

    await user.clear(legalName);
    await user.type(legalName, "Taller Norte Actualizado");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateCompany).toHaveBeenCalledWith("company-1", {
        legalName: "Taller Norte Actualizado",
        tradeName: "Norte",
        taxId: "DEMO-0001",
      });
    });
  });

  it("clears the optional fields only when those inputs are emptied", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("DEMO-0001")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByRole("textbox", { name: /nombre comercial/i }));
    await user.clear(screen.getByRole("textbox", { name: /identificador fiscal/i }));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateCompany).toHaveBeenCalledWith("company-1", {
        legalName: "Taller Norte",
        tradeName: null,
        taxId: null,
      });
    });
  });
});
