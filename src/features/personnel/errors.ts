import type { CommandError, PersonnelField } from "./types";

const fieldByCode: Record<string, PersonnelField> = {
  given_name_required: "givenName",
  given_name_too_long: "givenName",
  family_name_required: "familyName",
  family_name_too_long: "familyName",
  employee_number_required: "employeeNumber",
  employee_number_too_long: "employeeNumber",
  employee_number_invalid: "employeeNumber",
  duplicate_employee_number: "employeeNumber",
  administrative_status_invalid: "administrativeStatus",
};

export function readCommandError(error: unknown): CommandError {
  if (isCommandError(error)) {
    return error;
  }
  if (typeof error === "string" && error.trim()) {
    try {
      const parsed: unknown = JSON.parse(error);
      if (isCommandError(parsed)) {
        return parsed;
      }
    } catch {
      return { code: "unknown", message: error };
    }
    return { code: "unknown", message: error };
  }
  return {
    code: "unknown",
    message: "No se pudo completar la operación.",
  };
}

export function fieldForError(code: string): PersonnelField | null {
  return fieldByCode[code] ?? null;
}

function isCommandError(error: unknown): error is CommandError {
  if (!error || typeof error !== "object") {
    return false;
  }
  const value = error as Record<string, unknown>;
  return typeof value.code === "string" && typeof value.message === "string";
}
