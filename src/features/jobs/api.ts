import { invoke } from "@tauri-apps/api/core";

import type { Job, JobInput, JobStatus } from "./types";

export function listJobs(): Promise<Job[]> {
  return invoke<Job[]>("list_jobs");
}

export function getJob(id: string): Promise<Job> {
  return invoke<Job>("get_job", { id });
}

export function createJob(input: JobInput): Promise<Job> {
  return invoke<Job>("create_job", { input });
}

export function updateJob(id: string, input: JobInput): Promise<Job> {
  return invoke<Job>("update_job", { id, input });
}

export function setJobStatus(id: string, status: JobStatus): Promise<Job> {
  return invoke<Job>("set_job_status", { id, input: { status } });
}
