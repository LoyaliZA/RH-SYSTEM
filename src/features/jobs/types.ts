export const jobStatuses = ["active", "inactive"] as const;

export type JobStatus = (typeof jobStatuses)[number];

export type Job = {
  id: string;
  companyId: string;
  companyName: string;
  code: string;
  name: string;
  description: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
};

export type JobInput = {
  code: string;
  name: string;
  description: string | null;
};

export type JobFormValues = {
  code: string;
  name: string;
  description: string;
};

export type JobField = keyof JobFormValues;

export type CommandError = {
  code: string;
  message: string;
};

export const jobStatusLabels: Record<JobStatus, string> = {
  active: "Activo",
  inactive: "Inactivo",
};

export function isJobStatus(value: string): value is JobStatus {
  return jobStatuses.includes(value as JobStatus);
}
