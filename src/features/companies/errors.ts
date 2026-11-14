import type { CommandError, CompanyField } from "./types";

const fieldByCode: Record<string, CompanyField> = {
  legal_name_required: "legalName",
  legal_name_too_long: "legalName",
  trade_name_too_long: "tradeName",
  tax_id_invalid: "taxId",
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

export function fieldForError(code: string): CompanyField | null {
  return fieldByCode[code] ?? null;
}

function isCommandError(error: unknown): error is CommandError {
  if (!error || typeof error !== "object") {
    return false;
  }
  const value = error as Record<string, unknown>;
  return typeof value.code === "string" && typeof value.message === "string";
}
