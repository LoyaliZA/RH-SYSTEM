use rusqlite::{OptionalExtension, params};

use super::employment::{EmploymentRepository, StoredEmployment};
use super::sqlite::SqliteCompanyRepository;
use crate::domain::{EmploymentRelationship, JobAssignment};
use crate::error::AppError;

impl EmploymentRepository for SqliteCompanyRepository {
    fn insert_initial_employment(
        &self,
        relationship: EmploymentRelationship,
        assignment: JobAssignment,
    ) -> Result<(), AppError> {
        let transaction = self
            .connection()
            .unchecked_transaction()
            .map_err(AppError::database)?;
        transaction
            .execute(
                "INSERT INTO employment_relationships (
                    id, company_id, personnel_file_id, started_on, ended_on, created_at, updated_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    relationship.id,
                    relationship.company_id,
                    relationship.personnel_file_id,
                    relationship.started_on,
                    relationship.ended_on,
                    relationship.created_at,
                    relationship.updated_at,
                ],
            )
            .map_err(map_employment_write_error)?;
        transaction
            .execute(
                "INSERT INTO job_assignments (
                    id, company_id, employment_relationship_id, job_id, effective_on, ended_on,
                    created_at, updated_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    assignment.id,
                    assignment.company_id,
                    assignment.employment_relationship_id,
                    assignment.job_id,
                    assignment.effective_on,
                    assignment.ended_on,
                    assignment.created_at,
                    assignment.updated_at,
                ],
            )
            .map_err(map_employment_write_error)?;
        transaction.commit().map_err(AppError::database)?;
        Ok(())
    }

    fn find_open_employment(
        &self,
        company_id: &str,
        personnel_file_id: &str,
    ) -> Result<Option<StoredEmployment>, AppError> {
        self.connection()
            .query_row(
                "SELECT
                    r.id, r.company_id, r.personnel_file_id, r.started_on, r.ended_on,
                    r.created_at, r.updated_at,
                    a.id, a.company_id, a.employment_relationship_id, a.job_id,
                    a.effective_on, a.ended_on, a.created_at, a.updated_at,
                    j.code, j.name, j.status
                 FROM employment_relationships r
                 INNER JOIN job_assignments a
                    ON a.employment_relationship_id = r.id
                   AND a.company_id = r.company_id
                   AND a.ended_on IS NULL
                 INNER JOIN jobs j
                    ON j.id = a.job_id
                   AND j.company_id = r.company_id
                 WHERE r.company_id = ?1
                   AND r.personnel_file_id = ?2
                   AND r.ended_on IS NULL",
                params![company_id, personnel_file_id],
                map_stored,
            )
            .optional()
            .map_err(AppError::database)
    }
}

fn map_stored(row: &rusqlite::Row<'_>) -> rusqlite::Result<StoredEmployment> {
    Ok(StoredEmployment {
        relationship: EmploymentRelationship {
            id: row.get(0)?,
            company_id: row.get(1)?,
            personnel_file_id: row.get(2)?,
            started_on: row.get(3)?,
            ended_on: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
        },
        assignment: JobAssignment {
            id: row.get(7)?,
            company_id: row.get(8)?,
            employment_relationship_id: row.get(9)?,
            job_id: row.get(10)?,
            effective_on: row.get(11)?,
            ended_on: row.get(12)?,
            created_at: row.get(13)?,
            updated_at: row.get(14)?,
        },
        job_code: row.get(15)?,
        job_name: row.get(16)?,
        job_status: row.get(17)?,
    })
}

fn map_employment_write_error(error: rusqlite::Error) -> AppError {
    match constraint_message(&error) {
        Some(message) if message.contains("FOREIGN KEY") => AppError::CompanyBoundaryViolation,
        Some(message)
            if message.contains("UNIQUE")
                && (message.contains("employment_relationships")
                    || message.contains("idx_employment_relationships_one_open")) =>
        {
            AppError::OpenEmploymentRelationship
        }
        _ => AppError::database(error),
    }
}

fn constraint_message(error: &rusqlite::Error) -> Option<&str> {
    match error {
        rusqlite::Error::SqliteFailure(_, Some(message)) => Some(message.as_str()),
        _ => None,
    }
}
