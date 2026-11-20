import { describe, expect, it } from "vitest";

import { fieldForError, readCommandError } from "./errors";

describe("job command errors", () => {
  it("reads a structured command error", () => {
    expect(
      readCommandError({
        code: "duplicate_job_code",
        message: "Ya existe un puesto con ese código en la empresa activa.",
      }),
    ).toEqual({
      code: "duplicate_job_code",
      message: "Ya existe un puesto con ese código en la empresa activa.",
    });
  });

  it("maps field errors and leaves the production gate unattached", () => {
    expect(fieldForError("duplicate_job_code")).toBe("code");
    expect(fieldForError("job_name_required")).toBe("name");
    expect(fieldForError("job_description_too_long")).toBe("description");
    expect(fieldForError("personnel_disabled_in_production")).toBeNull();
    expect(fieldForError("job_not_found")).toBeNull();
  });
});
