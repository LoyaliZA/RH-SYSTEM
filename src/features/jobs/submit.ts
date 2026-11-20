import type { Job, JobFormValues, JobInput } from "./types";

export function blankJobForm(): JobFormValues {
  return { code: "", name: "", description: "" };
}

export function formValuesFromJob(job: Job): JobFormValues {
  return {
    code: job.code,
    name: job.name,
    description: job.description ?? "",
  };
}

export function toJobInput(values: JobFormValues): JobInput {
  const description = values.description.trim();
  return {
    code: values.code,
    name: values.name,
    description: description.length > 0 ? description : null,
  };
}

export function isJobFormDirty(
  values: JobFormValues,
  original: JobFormValues,
): boolean {
  return (
    values.code !== original.code ||
    values.name !== original.name ||
    values.description !== original.description
  );
}
