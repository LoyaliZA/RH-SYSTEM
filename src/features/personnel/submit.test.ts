import { describe, expect, it } from "vitest";

import { formValuesFromFile, isPersonnelFormDirty, toPersonnelInput } from "./submit";
import type { PersonnelFile } from "./types";

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

describe("personnel form mapping", () => {
  it("keeps stored fields when mapping a file", () => {
    expect(toPersonnelInput(formValuesFromFile(stored))).toEqual({
      givenName: "Alex",
      familyName: "Rivera",
      employeeNumber: "TN-001",
      administrativeStatus: "active",
    });
  });

  it("detects dirty values", () => {
    const values = formValuesFromFile(stored);
    expect(isPersonnelFormDirty(values, values)).toBe(false);
    expect(isPersonnelFormDirty({ ...values, familyName: "Rivera Soto" }, values)).toBe(
      true,
    );
  });
});
