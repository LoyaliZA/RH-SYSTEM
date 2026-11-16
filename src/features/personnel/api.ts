import { invoke } from "@tauri-apps/api/core";

import type { PersonnelFile, PersonnelFileInput } from "./types";

export function listPersonnelFiles(query?: string): Promise<PersonnelFile[]> {
  return invoke<PersonnelFile[]>("list_personnel_files", {
    query: query?.trim() ? query.trim() : null,
  });
}

export function getPersonnelFile(id: string): Promise<PersonnelFile> {
  return invoke<PersonnelFile>("get_personnel_file", { id });
}

export function createPersonnelFile(input: PersonnelFileInput): Promise<PersonnelFile> {
  return invoke<PersonnelFile>("create_personnel_file", { input });
}

export function updatePersonnelFile(
  id: string,
  input: PersonnelFileInput,
): Promise<PersonnelFile> {
  return invoke<PersonnelFile>("update_personnel_file", { id, input });
}
