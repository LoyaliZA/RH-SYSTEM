use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::{
    Company, EmploymentRelationship, EmploymentState, JobAssignment, JobStatus,
    parse_calendar_date, personnel_operations_permitted,
};
use crate::error::AppError;
use crate::persistence::{
    CompanyRepository, EmploymentRepository, JobRepository, PersonnelFileRepository,
    StoredEmployment,
};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct EmploymentWrite {
    pub personnel_file_id: String,
    pub job_id: String,
    pub started_on: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct EmploymentView {
    pub id: String,
    pub company_id: String,
    pub company_name: String,
    pub personnel_file_id: String,
    pub started_on: String,
    pub ended_on: Option<String>,
    pub state: String,
    pub assignment_id: String,
    pub job_id: String,
    pub job_code: String,
    pub job_name: String,
    pub job_status: String,
    pub effective_on: String,
}

pub(crate) fn get_employment_for_file(
    repository: &(impl CompanyRepository + PersonnelFileRepository + EmploymentRepository),
    personnel_file_id: &str,
) -> Result<Option<EmploymentView>, AppError> {
    get_employment_for_file_with_gate(repository, personnel_file_id, cfg!(debug_assertions))
}

pub(crate) fn create_employment_relationship(
    repository: &(
         impl CompanyRepository + PersonnelFileRepository + JobRepository + EmploymentRepository
     ),
    input: EmploymentWrite,
) -> Result<EmploymentView, AppError> {
    create_employment_relationship_with_gate(repository, input, cfg!(debug_assertions))
}

fn get_employment_for_file_with_gate(
    repository: &(impl CompanyRepository + PersonnelFileRepository + EmploymentRepository),
    personnel_file_id: &str,
    development_build: bool,
) -> Result<Option<EmploymentView>, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let Some(_) = repository.find_for_company(&company.id, personnel_file_id)? else {
        return Err(AppError::PersonnelFileNotFound);
    };
    let stored = repository.find_open_employment(&company.id, personnel_file_id)?;
    Ok(stored.map(|item| to_view(item, &company)))
}

fn create_employment_relationship_with_gate(
    repository: &(
         impl CompanyRepository + PersonnelFileRepository + JobRepository + EmploymentRepository
     ),
    input: EmploymentWrite,
    development_build: bool,
) -> Result<EmploymentView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let started_on = parse_calendar_date(&input.started_on)?;
    let file = repository
        .find_for_company(&company.id, &input.personnel_file_id)?
        .ok_or(AppError::PersonnelFileNotFound)?;
    let job = repository
        .find_job(&company.id, &input.job_id)?
        .ok_or(AppError::JobNotFound)?;
    if job.status != JobStatus::Active {
        return Err(AppError::JobNotAssignable);
    }
    if repository
        .find_open_employment(&company.id, &file.file.id)?
        .is_some()
    {
        return Err(AppError::OpenEmploymentRelationship);
    }
    let now = timestamp();
    let relationship_id = Uuid::new_v4().to_string();
    let assignment_id = Uuid::new_v4().to_string();
    let relationship = EmploymentRelationship {
        id: relationship_id.clone(),
        company_id: company.id.clone(),
        personnel_file_id: file.file.id.clone(),
        started_on: started_on.clone(),
        ended_on: None,
        created_at: now.clone(),
        updated_at: now.clone(),
    };
    let assignment = JobAssignment {
        id: assignment_id,
        company_id: company.id.clone(),
        employment_relationship_id: relationship_id,
        job_id: job.id.clone(),
        effective_on: started_on,
        ended_on: None,
        created_at: now.clone(),
        updated_at: now,
    };
    repository.insert_initial_employment(relationship, assignment)?;
    let stored = repository
        .find_open_employment(&company.id, &file.file.id)?
        .ok_or(AppError::PersonnelFileNotFound)?;
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

fn to_view(stored: StoredEmployment, company: &Company) -> EmploymentView {
    let state = EmploymentState::from_ended_on(stored.relationship.ended_on.as_deref());
    EmploymentView {
        id: stored.relationship.id,
        company_id: company.id.clone(),
        company_name: crate::domain::display_name(company),
        personnel_file_id: stored.relationship.personnel_file_id,
        started_on: stored.relationship.started_on,
        ended_on: stored.relationship.ended_on,
        state: state.as_str().to_string(),
        assignment_id: stored.assignment.id,
        job_id: stored.assignment.job_id,
        job_code: stored.job_code,
        job_name: stored.job_name,
        job_status: stored.job_status,
        effective_on: stored.assignment.effective_on,
    }
}

fn timestamp() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::SqliteCompanyRepository;
    use crate::use_cases::{
        CompanyWrite, JobStatusWrite, JobWrite, PersonnelFileWrite, create_company, create_job,
        create_personnel_file, get_personnel_file, set_active_company, set_job_status, update_job,
        update_personnel_file,
    };
    use std::fs;
    use std::path::{Path, PathBuf};

    struct TempDatabase {
        directory: PathBuf,
        path: PathBuf,
    }

    impl TempDatabase {
        fn new() -> Self {
            let directory =
                std::env::temp_dir().join(format!("rh-system-employment-{}", Uuid::new_v4()));
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

    fn file_write(number: &str) -> PersonnelFileWrite {
        PersonnelFileWrite {
            given_name: "Alex".to_string(),
            family_name: "Rivera".to_string(),
            employee_number: number.to_string(),
            administrative_status: "active".to_string(),
        }
    }

    fn job_write(code: &str) -> JobWrite {
        JobWrite {
            code: code.to_string(),
            name: "Operación de piso".to_string(),
            description: None,
        }
    }

    fn employment_write(file_id: &str, job_id: &str, started_on: &str) -> EmploymentWrite {
        EmploymentWrite {
            personnel_file_id: file_id.to_string(),
            job_id: job_id.to_string(),
            started_on: started_on.to_string(),
        }
    }

    #[test]
    fn creates_an_initial_relationship_for_a_file_in_the_same_company() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let north = create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let file = create_personnel_file(&repository, file_write("TN-001")).unwrap();
        let job = create_job(&repository, job_write("OP-01")).unwrap();

        let created = create_employment_relationship(
            &repository,
            employment_write(&file.id, &job.id, " 2026-11-16 "),
        )
        .unwrap();

        assert_eq!(created.company_id, north.id);
        assert_eq!(created.personnel_file_id, file.id);
        assert_eq!(created.started_on, "2026-11-16");
        assert_eq!(created.effective_on, "2026-11-16");
        assert_eq!(created.ended_on, None);
        assert_eq!(created.state, "open");
        assert_eq!(created.job_id, job.id);
        assert_eq!(created.job_code, "OP-01");
        assert_eq!(created.job_name, "Operación de piso");
        assert_ne!(created.id, job.id);
        assert_ne!(created.id, created.assignment_id);
        assert_ne!(created.assignment_id, job.id);

        let unchanged = get_personnel_file(&repository, &file.id).unwrap();
        assert_eq!(unchanged.employee_number, "TN-001");
        assert_eq!(unchanged.given_name, "Alex");
        assert_eq!(unchanged.family_name, "Rivera");
        assert_eq!(unchanged.administrative_status, "active");
        assert_eq!(unchanged.person_id, file.person_id);
    }

    #[test]
    fn rejects_a_job_or_file_from_another_company() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let north_file = create_personnel_file(&repository, file_write("TN-001")).unwrap();
        let north_job = create_job(&repository, job_write("OP-01")).unwrap();
        let south = create_company(&repository, company_write("Estudio Sur", "", "")).unwrap();
        set_active_company(&repository, &south.id).unwrap();
        let south_file = create_personnel_file(&repository, file_write("ES-010")).unwrap();
        let south_job = create_job(&repository, job_write("OP-01")).unwrap();

        let foreign_job = create_employment_relationship(
            &repository,
            employment_write(&south_file.id, &north_job.id, "2026-11-16"),
        )
        .unwrap_err();
        assert_eq!(foreign_job, AppError::JobNotFound);
        assert!(!foreign_job.message().contains("TN-001"));
        assert!(!foreign_job.message().contains(&north_job.id));

        let foreign_file = create_employment_relationship(
            &repository,
            employment_write(&north_file.id, &south_job.id, "2026-11-16"),
        )
        .unwrap_err();
        assert_eq!(foreign_file, AppError::PersonnelFileNotFound);
        assert!(get_employment_for_file(&repository, &north_file.id).is_err());
        assert!(
            get_employment_for_file(&repository, &south_file.id)
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn blocks_a_second_open_relationship_and_invalid_dates() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let file = create_personnel_file(&repository, file_write("TN-001")).unwrap();
        let job = create_job(&repository, job_write("OP-01")).unwrap();
        let first = create_employment_relationship(
            &repository,
            employment_write(&file.id, &job.id, "2026-11-16"),
        )
        .unwrap();

        let second = create_employment_relationship(
            &repository,
            employment_write(&file.id, &job.id, "2027-01-01"),
        )
        .unwrap_err();
        assert_eq!(second, AppError::OpenEmploymentRelationship);
        let current = get_employment_for_file(&repository, &file.id)
            .unwrap()
            .unwrap();
        assert_eq!(current.id, first.id);
        assert_eq!(current.started_on, "2026-11-16");

        for value in ["2026-02-31", "2026-11-16T00:00:00Z", "16/11/2026", ""] {
            let error = create_employment_relationship(
                &repository,
                employment_write("missing-file", &job.id, value),
            )
            .unwrap_err();
            assert_eq!(error, AppError::CalendarDateInvalid, "{value}");
        }
        assert_eq!(
            create_employment_relationship(
                &repository,
                employment_write(&file.id, &job.id, "1899-01-01"),
            )
            .unwrap_err(),
            AppError::CalendarDateOutOfRange
        );
    }

    #[test]
    fn keeps_the_assignment_when_the_job_changes_and_ignores_administrative_status() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let file = create_personnel_file(&repository, file_write("TN-001")).unwrap();
        let job = create_job(&repository, job_write("OP-01")).unwrap();
        let created = create_employment_relationship(
            &repository,
            employment_write(&file.id, &job.id, "2026-11-16"),
        )
        .unwrap();

        update_personnel_file(
            &repository,
            &file.id,
            PersonnelFileWrite {
                given_name: "Alex".to_string(),
                family_name: "Rivera".to_string(),
                employee_number: "TN-001".to_string(),
                administrative_status: "inactive".to_string(),
            },
        )
        .unwrap();
        update_job(
            &repository,
            &job.id,
            JobWrite {
                code: "OP-09".to_string(),
                name: "Operación revisada".to_string(),
                description: Some("Sigue referenciado".to_string()),
            },
        )
        .unwrap();
        set_job_status(
            &repository,
            &job.id,
            JobStatusWrite {
                status: "inactive".to_string(),
            },
        )
        .unwrap();

        let linked = get_employment_for_file(&repository, &file.id)
            .unwrap()
            .unwrap();
        assert_eq!(linked.id, created.id);
        assert_eq!(linked.assignment_id, created.assignment_id);
        assert_eq!(linked.job_id, job.id);
        assert_eq!(linked.job_code, "OP-09");
        assert_eq!(linked.job_name, "Operación revisada");
        assert_eq!(linked.job_status, "inactive");
        assert_eq!(linked.state, "open");
        assert_eq!(linked.started_on, "2026-11-16");

        let other = create_personnel_file(&repository, file_write("TN-002")).unwrap();
        let rejected = create_employment_relationship(
            &repository,
            employment_write(&other.id, &job.id, "2026-12-01"),
        )
        .unwrap_err();
        assert_eq!(rejected, AppError::JobNotAssignable);
        let still = get_personnel_file(&repository, &file.id).unwrap();
        assert_eq!(still.administrative_status, "inactive");
        assert_eq!(still.employee_number, "TN-001");

        drop(repository);
        let reopened = SqliteCompanyRepository::open(database.path()).unwrap();
        let restored = get_employment_for_file(&reopened, &file.id)
            .unwrap()
            .unwrap();
        assert_eq!(restored.id, created.id);
        assert_eq!(restored.job_name, "Operación revisada");
        assert_eq!(restored.job_status, "inactive");
        assert_eq!(restored.state, "open");
    }

    #[test]
    fn production_gate_blocks_employment_use_cases() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let file = create_personnel_file(&repository, file_write("TN-001")).unwrap();
        let job = create_job(&repository, job_write("OP-01")).unwrap();
        let error = create_employment_relationship_with_gate(
            &repository,
            employment_write(&file.id, &job.id, "2026-11-16"),
            false,
        )
        .unwrap_err();
        assert_eq!(error.code(), "personnel_disabled_in_production");
        assert!(get_employment_for_file_with_gate(&repository, &file.id, false).is_err());
        assert!(
            get_employment_for_file(&repository, &file.id)
                .unwrap()
                .is_none()
        );
    }
}
