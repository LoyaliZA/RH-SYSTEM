import { invoke } from "@tauri-apps/api/core";

import type { Company, CompanyInput } from "./types";

export function listCompanies(): Promise<Company[]> {
  return invoke<Company[]>("list_companies");
}

export function createCompany(input: CompanyInput): Promise<Company> {
  return invoke<Company>("create_company", { input });
}

export function updateCompany(id: string, input: CompanyInput): Promise<Company> {
  return invoke<Company>("update_company", { id, input });
}

export function setActiveCompany(id: string): Promise<Company> {
  return invoke<Company>("set_active_company", { id });
}
