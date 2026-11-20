export const administrativeStatuses = ["active", "inactive"] as const;

export type AdministrativeStatus = (typeof administrativeStatuses)[number];

export type PersonnelFile = {
  id: string;
  personId: string;
  companyId: string;
  companyName: string;
  employeeNumber: string;
  givenName: string;
  familyName: string;
  administrativeStatus: AdministrativeStatus;
  createdAt: string;
  updatedAt: string;
};

export type PersonnelFileInput = {
  givenName: string;
  familyName: string;
  employeeNumber: string;
  administrativeStatus: AdministrativeStatus;
};

export type PersonnelFormValues = {
  givenName: string;
  familyName: string;
  employeeNumber: string;
  administrativeStatus: AdministrativeStatus;
};

export type PersonnelField = keyof PersonnelFormValues;

export type CommandError = {
  code: string;
  message: string;
};

export const emptyPersonnelForm: PersonnelFormValues = {
  givenName: "",
  familyName: "",
  employeeNumber: "",
  administrativeStatus: "active",
};

export const administrativeStatusLabels: Record<AdministrativeStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

export function isAdministrativeStatus(value: string): value is AdministrativeStatus {
  return administrativeStatuses.includes(value as AdministrativeStatus);
}
