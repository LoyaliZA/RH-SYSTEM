import { invoke } from "@tauri-apps/api/core";

import type { EmploymentInput, EmploymentRelationship } from "./types";

export function getEmploymentForFile(
  personnelFileId: string,
): Promise<EmploymentRelationship | null> {
  return invoke<EmploymentRelationship | null>("get_employment_for_file", {
    personnelFileId,
  });
}

export function createEmploymentRelationship(
  input: EmploymentInput,
): Promise<EmploymentRelationship> {
  return invoke<EmploymentRelationship>("create_employment_relationship", { input });
}
