export type EmploymentState = "open" | "closed";

export type EmploymentRelationship = {
  id: string;
  companyId: string;
  companyName: string;
  personnelFileId: string;
  startedOn: string;
  endedOn: string | null;
  state: EmploymentState;
  assignmentId: string;
  jobId: string;
  jobCode: string;
  jobName: string;
  jobStatus: "active" | "inactive";
  effectiveOn: string;
};

export type EmploymentInput = {
  personnelFileId: string;
  jobId: string;
  startedOn: string;
};

export type CommandError = {
  code: string;
  message: string;
};

export const employmentStateLabels: Record<EmploymentState, string> = {
  open: "Vigente",
  closed: "Concluida",
};
