use rusqlite::{OptionalExtension, params};

use super::job::JobRepository;
use super::sqlite::SqliteCompanyRepository;
use crate::domain::{Job, JobStatus};
use crate::error::AppError;

impl JobRepository for SqliteCompanyRepository {
    fn insert_job(&self, job: Job) -> Result<Job, AppError> {
        self.connection()
            .execute(
                "INSERT INTO jobs (
                    id, company_id, code, name, description, status, created_at, updated_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    job.id,
                    job.company_id,
                    job.code,
                    job.name,
                    job.description,
                    job.status.as_str(),
                    job.created_at,
                    job.updated_at,
                ],
            )
            .map_err(map_job_write_error)?;
        Ok(job)
    }

    fn update_job(&self, job: Job) -> Result<Job, AppError> {
        let changed = self
            .connection()
            .execute(
                "UPDATE jobs
                 SET code = ?1, name = ?2, description = ?3, updated_at = ?4
                 WHERE id = ?5 AND company_id = ?6",
                params![
                    job.code,
                    job.name,
                    job.description,
                    job.updated_at,
                    job.id,
                    job.company_id,
                ],
            )
            .map_err(map_job_write_error)?;
        if changed == 0 {
            return Err(AppError::JobNotFound);
        }
        Ok(job)
    }

    fn set_job_status(&self, job: Job) -> Result<Job, AppError> {
        let changed = self
            .connection()
            .execute(
                "UPDATE jobs
                 SET status = ?1, updated_at = ?2
                 WHERE id = ?3 AND company_id = ?4",
                params![job.status.as_str(), job.updated_at, job.id, job.company_id],
            )
            .map_err(map_job_write_error)?;
        if changed == 0 {
            return Err(AppError::JobNotFound);
        }
        Ok(job)
    }

    fn list_jobs(&self, company_id: &str) -> Result<Vec<Job>, AppError> {
        let mut statement = self
            .connection()
            .prepare(
                "SELECT id, company_id, code, name, description, status, created_at, updated_at
                 FROM jobs
                 WHERE company_id = ?1
                 ORDER BY code COLLATE NOCASE, id",
            )
            .map_err(AppError::database)?;
        let rows = statement
            .query_map(params![company_id], map_job)
            .map_err(AppError::database)?;
        let mut jobs = Vec::new();
        for row in rows {
            jobs.push(row.map_err(AppError::database)?);
        }
        Ok(jobs)
    }

    fn find_job(&self, company_id: &str, job_id: &str) -> Result<Option<Job>, AppError> {
        self.connection()
            .query_row(
                "SELECT id, company_id, code, name, description, status, created_at, updated_at
                 FROM jobs
                 WHERE id = ?1 AND company_id = ?2",
                params![job_id, company_id],
                map_job,
            )
            .optional()
            .map_err(AppError::database)
    }

    fn find_job_by_code(
        &self,
        company_id: &str,
        code: &str,
        excluding_job_id: Option<&str>,
    ) -> Result<Option<Job>, AppError> {
        self.connection()
            .query_row(
                "SELECT id, company_id, code, name, description, status, created_at, updated_at
                 FROM jobs
                 WHERE company_id = ?1
                   AND code = ?2 COLLATE NOCASE
                   AND (?3 IS NULL OR id != ?3)",
                params![company_id, code, excluding_job_id],
                map_job,
            )
            .optional()
            .map_err(AppError::database)
    }
}

fn map_job(row: &rusqlite::Row<'_>) -> rusqlite::Result<Job> {
    let status: String = row.get(5)?;
    let parsed = JobStatus::parse(&status).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(5, rusqlite::types::Type::Text, Box::new(error))
    })?;
    Ok(Job {
        id: row.get(0)?,
        company_id: row.get(1)?,
        code: row.get(2)?,
        name: row.get(3)?,
        description: row.get(4)?,
        status: parsed,
        created_at: row.get(6)?,
        updated_at: row.get(7)?,
    })
}

fn map_job_write_error(error: rusqlite::Error) -> AppError {
    match constraint_message(&error) {
        Some(message) if message.contains("UNIQUE") && message.contains("jobs") => {
            AppError::DuplicateJobCode
        }
        Some(message) if message.contains("FOREIGN KEY") => AppError::CompanyBoundaryViolation,
        _ => AppError::database(error),
    }
}

fn constraint_message(error: &rusqlite::Error) -> Option<&str> {
    match error {
        rusqlite::Error::SqliteFailure(_, Some(message)) => Some(message.as_str()),
        _ => None,
    }
}
