import type { Company, CompanyFormValues, CompanyInput } from "./types";

export function formValuesFromCompany(company: Company): CompanyFormValues {
  return {
    legalName: company.legalName,
    tradeName: company.tradeName ?? "",
    taxId: company.taxId ?? "",
  };
}

export function toCompanyInput(values: CompanyFormValues): CompanyInput {
  return {
    legalName: values.legalName,
    tradeName: blankToNull(values.tradeName),
    taxId: blankToNull(values.taxId),
  };
}

function blankToNull(value: string): string | null {
  return value.trim() ? value : null;
}
