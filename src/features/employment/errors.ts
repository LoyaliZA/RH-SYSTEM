import type { CommandError } from "./types";

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

function isCommandError(error: unknown): error is CommandError {
  if (!error || typeof error !== "object") {
    return false;
  }
  const value = error as Record<string, unknown>;
  return typeof value.code === "string" && typeof value.message === "string";
}
