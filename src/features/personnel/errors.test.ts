import { describe, expect, it } from "vitest";

import { fieldForError, readCommandError } from "./errors";

describe("personnel command errors", () => {
  it("reads a structured command error", () => {
    expect(
      readCommandError({
        code: "duplicate_employee_number",
        message:
          "Ya existe un expediente con ese número de empleado en la empresa activa.",
      }),
    ).toEqual({
      code: "duplicate_employee_number",
      message:
        "Ya existe un expediente con ese número de empleado en la empresa activa.",
    });
  });

  it("maps validation codes to form fields", () => {
    expect(fieldForError("given_name_required")).toBe("givenName");
    expect(fieldForError("employee_number_invalid")).toBe("employeeNumber");
    expect(fieldForError("personnel_disabled_in_production")).toBeNull();
  });
});
