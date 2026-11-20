import { describe, expect, it } from "vitest";

import { blankJobForm, formValuesFromJob, isJobFormDirty, toJobInput } from "./submit";
import type { Job } from "./types";

const stored: Job = {
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

describe("job form mapping", () => {
  it("sends an empty description as null", () => {
    expect(toJobInput({ ...blankJobForm(), code: "OP-01", name: "Operación" })).toEqual(
      {
        code: "OP-01",
        name: "Operación",
        description: null,
      },
    );
  });

  it("keeps a description and detects edits", () => {
    const values = formValuesFromJob({ ...stored, description: "Piso" });
    expect(values.description).toBe("Piso");
    expect(isJobFormDirty(values, values)).toBe(false);
    expect(isJobFormDirty({ ...values, name: "Operación revisada" }, values)).toBe(
      true,
    );
    expect(toJobInput(values).description).toBe("Piso");
  });
});
