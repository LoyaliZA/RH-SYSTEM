import type { CommandError, JobField } from "./types";

const fieldByCode: Record<string, JobField> = {
  job_code_required: "code",
  job_code_too_long: "code",
  job_code_invalid: "code",
  duplicate_job_code: "code",
  job_name_required: "name",
  job_name_too_long: "name",
  job_description_too_long: "description",
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

export function fieldForError(code: string): JobField | null {
  return fieldByCode[code] ?? null;
}

function isCommandError(error: unknown): error is CommandError {
  if (!error || typeof error !== "object") {
    return false;
  }
  const value = error as Record<string, unknown>;
  return typeof value.code === "string" && typeof value.message === "string";
}
