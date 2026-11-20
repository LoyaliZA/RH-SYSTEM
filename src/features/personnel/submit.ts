import {
  emptyPersonnelForm,
  isAdministrativeStatus,
  type PersonnelFile,
  type PersonnelFileInput,
  type PersonnelFormValues,
} from "./types";

export function formValuesFromFile(file: PersonnelFile): PersonnelFormValues {
  return {
    givenName: file.givenName,
    familyName: file.familyName,
    employeeNumber: file.employeeNumber,
    administrativeStatus: isAdministrativeStatus(file.administrativeStatus)
      ? file.administrativeStatus
      : "inactive",
  };
}

export function toPersonnelInput(values: PersonnelFormValues): PersonnelFileInput {
  return {
    givenName: values.givenName,
    familyName: values.familyName,
    employeeNumber: values.employeeNumber,
    administrativeStatus: values.administrativeStatus,
  };
}

export function isPersonnelFormDirty(
  values: PersonnelFormValues,
  original: PersonnelFormValues,
): boolean {
  return (
    values.givenName !== original.givenName ||
    values.familyName !== original.familyName ||
    values.employeeNumber !== original.employeeNumber ||
    values.administrativeStatus !== original.administrativeStatus
  );
}

export function blankPersonnelForm(): PersonnelFormValues {
  return { ...emptyPersonnelForm };
}
