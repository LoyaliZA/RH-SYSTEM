export type Company = {
  id: string;
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = {
  legalName: string;
  tradeName: string | null;
  taxId: string | null;
};

export type CompanyFormValues = {
  legalName: string;
  tradeName: string;
  taxId: string;
};

export type CompanyField = keyof CompanyFormValues;

export type CommandError = {
  code: string;
  message: string;
};

export const emptyCompanyForm: CompanyFormValues = {
  legalName: "",
  tradeName: "",
  taxId: "",
};
