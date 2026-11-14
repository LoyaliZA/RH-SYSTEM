import { describe, expect, it } from "vitest";

import { fieldForError, readCommandError } from "./errors";

describe("readCommandError", () => {
  it("reads a structured command error", () => {
    expect(
      readCommandError({
        code: "legal_name_required",
        message: "La razón social es obligatoria.",
      }),
    ).toEqual({
      code: "legal_name_required",
      message: "La razón social es obligatoria.",
    });
  });

  it("falls back when the failure has no structure", () => {
    expect(readCommandError(undefined)).toEqual({
      code: "unknown",
      message: "No se pudo completar la operación.",
    });
  });
});

describe("fieldForError", () => {
  it("maps validation codes to form fields", () => {
    expect(fieldForError("tax_id_invalid")).toBe("taxId");
    expect(fieldForError("database")).toBeNull();
  });
});
