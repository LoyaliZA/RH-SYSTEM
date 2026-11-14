import { describe, expect, it } from "vitest";

import { formValuesFromCompany, toCompanyInput } from "./submit";
import type { Company } from "./types";

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

describe("company form mapping", () => {
  it("keeps stored optional fields when only the legal name changes", () => {
    const values = formValuesFromCompany(stored);
    values.legalName = "Taller Norte Actualizado";

    expect(toCompanyInput(values)).toEqual({
      legalName: "Taller Norte Actualizado",
      tradeName: "Norte",
      taxId: "DEMO-0001",
    });
  });

  it("turns a cleared optional field into an absent value", () => {
    const values = formValuesFromCompany(stored);
    values.tradeName = "   ";
    values.taxId = "";

    expect(toCompanyInput(values)).toEqual({
      legalName: "Taller Norte",
      tradeName: null,
      taxId: null,
    });
  });
});
