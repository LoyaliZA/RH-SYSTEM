use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::{Company, Job, JobStatus, personnel_operations_permitted, validate_job_draft};
use crate::error::AppError;
use crate::persistence::{CompanyRepository, JobRepository};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct JobWrite {
    pub code: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct JobStatusWrite {
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct JobView {
    pub id: String,
    pub company_id: String,
    pub company_name: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

pub(crate) fn list_jobs(
    repository: &(impl CompanyRepository + JobRepository),
) -> Result<Vec<JobView>, AppError> {
    list_jobs_with_gate(repository, cfg!(debug_assertions))
}

pub(crate) fn get_job(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
) -> Result<JobView, AppError> {
    get_job_with_gate(repository, id, cfg!(debug_assertions))
}

pub(crate) fn create_job(
    repository: &(impl CompanyRepository + JobRepository),
    input: JobWrite,
) -> Result<JobView, AppError> {
    create_job_with_gate(repository, input, cfg!(debug_assertions))
}

pub(crate) fn update_job(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
    input: JobWrite,
) -> Result<JobView, AppError> {
    update_job_with_gate(repository, id, input, cfg!(debug_assertions))
}

pub(crate) fn set_job_status(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
    input: JobStatusWrite,
) -> Result<JobView, AppError> {
    set_job_status_with_gate(repository, id, input, cfg!(debug_assertions))
}

fn list_jobs_with_gate(
    repository: &(impl CompanyRepository + JobRepository),
    development_build: bool,
) -> Result<Vec<JobView>, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let jobs = repository.list_jobs(&company.id)?;
    Ok(jobs.into_iter().map(|job| to_view(job, &company)).collect())
}

fn get_job_with_gate(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
    development_build: bool,
) -> Result<JobView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let job = repository
        .find_job(&company.id, id)?
        .ok_or(AppError::JobNotFound)?;
    Ok(to_view(job, &company))
}

fn create_job_with_gate(
    repository: &(impl CompanyRepository + JobRepository),
    input: JobWrite,
    development_build: bool,
) -> Result<JobView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let draft = validate_job_draft(&input.code, &input.name, input.description.as_deref())?;
    if repository
        .find_job_by_code(&company.id, &draft.code, None)?
        .is_some()
    {
        return Err(AppError::DuplicateJobCode);
    }
    let now = timestamp();
    let job = Job {
        id: Uuid::new_v4().to_string(),
        company_id: company.id.clone(),
        code: draft.code,
        name: draft.name,
        description: draft.description,
        status: JobStatus::Active,
        created_at: now.clone(),
        updated_at: now,
    };
    let stored = repository.insert_job(job)?;
    Ok(to_view(stored, &company))
}

fn update_job_with_gate(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
    input: JobWrite,
    development_build: bool,
) -> Result<JobView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let existing = repository
        .find_job(&company.id, id)?
        .ok_or(AppError::JobNotFound)?;
    let draft = validate_job_draft(&input.code, &input.name, input.description.as_deref())?;
    if repository
        .find_job_by_code(&company.id, &draft.code, Some(&existing.id))?
        .is_some()
    {
        return Err(AppError::DuplicateJobCode);
    }
    let job = Job {
        id: existing.id,
        company_id: company.id.clone(),
        code: draft.code,
        name: draft.name,
        description: draft.description,
        status: existing.status,
        created_at: existing.created_at,
        updated_at: timestamp(),
    };
    let stored = repository.update_job(job)?;
    Ok(to_view(stored, &company))
}

fn set_job_status_with_gate(
    repository: &(impl CompanyRepository + JobRepository),
    id: &str,
    input: JobStatusWrite,
    development_build: bool,
) -> Result<JobView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let existing = repository
        .find_job(&company.id, id)?
        .ok_or(AppError::JobNotFound)?;
    let status = JobStatus::parse(&input.status)?;
    let job = Job {
        status,
        updated_at: timestamp(),
        ..existing
    };
    let stored = repository.set_job_status(job)?;
    Ok(to_view(stored, &company))
}

fn require_active_company(repository: &impl CompanyRepository) -> Result<Company, AppError> {
    let active_id = repository
        .active_id()?
        .ok_or(AppError::ActiveCompanyRequired)?;
    repository
        .find(&active_id)?
        .ok_or(AppError::ActiveCompanyRequired)
}

fn to_view(job: Job, company: &Company) -> JobView {
    JobView {
        id: job.id,
        company_id: company.id.clone(),
        company_name: crate::domain::display_name(company),
        code: job.code,
        name: job.name,
        description: job.description,
        status: job.status.as_str().to_string(),
        created_at: job.created_at,
        updated_at: job.updated_at,
    }
}

fn timestamp() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::SqliteCompanyRepository;
    use crate::use_cases::{CompanyWrite, create_company, set_active_company};
    use std::fs;
    use std::path::{Path, PathBuf};

    struct TempDatabase {
        directory: PathBuf,
        path: PathBuf,
    }

    impl TempDatabase {
        fn new() -> Self {
            let directory = std::env::temp_dir().join(format!("rh-system-jobs-{}", Uuid::new_v4()));
            fs::create_dir_all(&directory).unwrap();
            let path = directory.join("rh-system.sqlite");
            Self { directory, path }
        }

        fn path(&self) -> &Path {
            &self.path
        }
    }

    impl Drop for TempDatabase {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.directory);
        }
    }

    fn company_write(legal_name: &str, trade_name: &str, tax_id: &str) -> CompanyWrite {
        CompanyWrite {
            legal_name: legal_name.to_string(),
            trade_name: Some(trade_name.to_string()),
            tax_id: Some(tax_id.to_string()),
        }
    }

    fn job_write(code: &str, name: &str, description: Option<&str>) -> JobWrite {
        JobWrite {
            code: code.to_string(),
            name: name.to_string(),
            description: description.map(str::to_string),
        }
    }

    #[test]
    fn same_code_is_allowed_in_another_company_and_hidden_across_the_boundary() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let north = create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let south = create_company(&repository, company_write("Estudio Sur", "", "")).unwrap();

        let created =
            create_job(&repository, job_write("OP-01", "Operación de piso", None)).unwrap();
        assert_eq!(created.code, "OP-01");
        assert_eq!(created.company_id, north.id);
        assert_eq!(created.company_name, "Norte");
        assert_eq!(created.status, "active");
        assert!(created.description.is_none());

        set_active_company(&repository, &south.id).unwrap();
        let south_job = create_job(
            &repository,
            job_write("op-01", "Operación sur", Some("Turno sintético")),
        )
        .unwrap();
        assert_eq!(south_job.code, "op-01");
        assert_eq!(south_job.company_id, south.id);
        assert_ne!(south_job.id, created.id);
        assert_eq!(
            get_job(&repository, &created.id).unwrap_err(),
            AppError::JobNotFound
        );
        assert_eq!(list_jobs(&repository).unwrap().len(), 1);

        set_active_company(&repository, &north.id).unwrap();
        let listed = list_jobs(&repository).unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].id, created.id);
        assert_eq!(
            get_job(&repository, &south_job.id).unwrap_err(),
            AppError::JobNotFound
        );
    }

    #[test]
    fn rejects_a_duplicate_code_in_the_same_company() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        create_job(&repository, job_write("OP-01", "Operación", None)).unwrap();
        let error =
            create_job(&repository, job_write("op-01", "Otra operación", None)).unwrap_err();
        assert_eq!(error, AppError::DuplicateJobCode);
        assert_eq!(list_jobs(&repository).unwrap().len(), 1);
    }

    #[test]
    fn edits_and_deactivates_without_deleting_the_job() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let created = create_job(
            &repository,
            job_write("OP-01", "Operación", Some("  Piso  ")),
        )
        .unwrap();
        assert_eq!(created.description.as_deref(), Some("Piso"));

        let updated = update_job(
            &repository,
            &created.id,
            job_write("OP-02", "Operación de piso", None),
        )
        .unwrap();
        assert_eq!(updated.code, "OP-02");
        assert_eq!(updated.name, "Operación de piso");
        assert_eq!(updated.description, None);
        assert_eq!(updated.status, "active");
        assert_eq!(updated.created_at, created.created_at);

        let inactive = set_job_status(
            &repository,
            &created.id,
            JobStatusWrite {
                status: "inactive".to_string(),
            },
        )
        .unwrap();
        assert_eq!(inactive.status, "inactive");
        assert_eq!(inactive.code, "OP-02");

        drop(repository);
        let reopened = SqliteCompanyRepository::open(database.path()).unwrap();
        let restored = get_job(&reopened, &created.id).unwrap();
        assert_eq!(restored.name, "Operación de piso");
        assert_eq!(restored.status, "inactive");
        assert_eq!(restored.code, "OP-02");
    }

    #[test]
    fn requires_an_active_company_and_rejects_invalid_input() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let missing = create_job(&repository, job_write("OP-01", "Operación", None)).unwrap_err();
        assert_eq!(missing, AppError::ActiveCompanyRequired);

        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let invalid = create_job(&repository, job_write("OP 01", "Operación", None)).unwrap_err();
        assert_eq!(invalid, AppError::JobCodeInvalid);
        assert!(list_jobs(&repository).unwrap().is_empty());
        assert_eq!(
            get_job(&repository, "missing").unwrap_err(),
            AppError::JobNotFound
        );
        assert_eq!(
            set_job_status(
                &repository,
                "missing",
                JobStatusWrite {
                    status: "active".to_string(),
                },
            )
            .unwrap_err(),
            AppError::JobNotFound
        );
    }

    #[test]
    fn production_gate_blocks_job_use_cases() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let error = create_job_with_gate(&repository, job_write("OP-01", "Operación", None), false)
            .unwrap_err();
        assert_eq!(error.code(), "personnel_disabled_in_production");
        assert!(list_jobs_with_gate(&repository, false).is_err());
        assert!(get_job_with_gate(&repository, "any", false).is_err());
        assert!(
            update_job_with_gate(
                &repository,
                "any",
                job_write("OP-01", "Operación", None),
                false
            )
            .is_err()
        );
        assert!(
            set_job_status_with_gate(
                &repository,
                "any",
                JobStatusWrite {
                    status: "inactive".to_string(),
                },
                false,
            )
            .is_err()
        );
        assert!(list_jobs(&repository).unwrap().is_empty());
    }
}
