use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::{
    Company, Person, PersonnelFile, PersonnelRecord, display_name, like_pattern,
    personnel_operations_permitted, validate_personnel_draft,
};
use crate::error::AppError;
use crate::persistence::{CompanyRepository, PersonnelFileRepository};

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PersonnelFileWrite {
    pub given_name: String,
    pub family_name: String,
    pub employee_number: String,
    pub administrative_status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PersonnelFileView {
    pub id: String,
    pub person_id: String,
    pub company_id: String,
    pub company_name: String,
    pub employee_number: String,
    pub given_name: String,
    pub family_name: String,
    pub administrative_status: String,
    pub created_at: String,
    pub updated_at: String,
}

pub(crate) fn list_personnel_files(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    query: Option<String>,
) -> Result<Vec<PersonnelFileView>, AppError> {
    list_personnel_files_with_gate(repository, query, cfg!(debug_assertions))
}

pub(crate) fn get_personnel_file(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    id: &str,
) -> Result<PersonnelFileView, AppError> {
    get_personnel_file_with_gate(repository, id, cfg!(debug_assertions))
}

pub(crate) fn create_personnel_file(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    input: PersonnelFileWrite,
) -> Result<PersonnelFileView, AppError> {
    create_personnel_file_with_gate(repository, input, cfg!(debug_assertions))
}

pub(crate) fn update_personnel_file(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    id: &str,
    input: PersonnelFileWrite,
) -> Result<PersonnelFileView, AppError> {
    update_personnel_file_with_gate(repository, id, input, cfg!(debug_assertions))
}

fn list_personnel_files_with_gate(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    query: Option<String>,
    development_build: bool,
) -> Result<Vec<PersonnelFileView>, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let pattern = query.as_deref().and_then(like_pattern);
    let records = repository.list_for_company(&company.id, pattern.as_deref())?;
    Ok(records
        .into_iter()
        .map(|record| to_view(record, &company))
        .collect())
}

fn get_personnel_file_with_gate(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    id: &str,
    development_build: bool,
) -> Result<PersonnelFileView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let record = repository
        .find_for_company(&company.id, id)?
        .ok_or(AppError::PersonnelFileNotFound)?;
    Ok(to_view(record, &company))
}

fn create_personnel_file_with_gate(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    input: PersonnelFileWrite,
    development_build: bool,
) -> Result<PersonnelFileView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let draft = validate_personnel_draft(
        &input.given_name,
        &input.family_name,
        &input.employee_number,
        &input.administrative_status,
    )?;
    if repository
        .find_by_employee_number(&company.id, &draft.employee_number, None)?
        .is_some()
    {
        return Err(AppError::DuplicateEmployeeNumber);
    }
    let now = timestamp();
    let person_id = Uuid::new_v4().to_string();
    let file_id = Uuid::new_v4().to_string();
    let record = PersonnelRecord {
        person: Person {
            id: person_id.clone(),
            company_id: company.id.clone(),
            given_name: draft.given_name,
            family_name: draft.family_name,
            created_at: now.clone(),
            updated_at: now.clone(),
            archived_at: None,
        },
        file: PersonnelFile {
            id: file_id,
            company_id: company.id.clone(),
            person_id,
            employee_number: draft.employee_number,
            administrative_status: draft.administrative_status,
            created_at: now.clone(),
            updated_at: now,
            archived_at: None,
        },
    };
    let stored = repository.insert_record(record)?;
    Ok(to_view(stored, &company))
}

fn update_personnel_file_with_gate(
    repository: &(impl CompanyRepository + PersonnelFileRepository),
    id: &str,
    input: PersonnelFileWrite,
    development_build: bool,
) -> Result<PersonnelFileView, AppError> {
    personnel_operations_permitted(development_build)?;
    let company = require_active_company(repository)?;
    let existing = repository
        .find_for_company(&company.id, id)?
        .ok_or(AppError::PersonnelFileNotFound)?;
    let draft = validate_personnel_draft(
        &input.given_name,
        &input.family_name,
        &input.employee_number,
        &input.administrative_status,
    )?;
    if repository
        .find_by_employee_number(&company.id, &draft.employee_number, Some(&existing.file.id))?
        .is_some()
    {
        return Err(AppError::DuplicateEmployeeNumber);
    }
    let now = timestamp();
    let record = PersonnelRecord {
        person: Person {
            id: existing.person.id,
            company_id: company.id.clone(),
            given_name: draft.given_name,
            family_name: draft.family_name,
            created_at: existing.person.created_at,
            updated_at: now.clone(),
            archived_at: None,
        },
        file: PersonnelFile {
            id: existing.file.id,
            company_id: company.id.clone(),
            person_id: existing.file.person_id,
            employee_number: draft.employee_number,
            administrative_status: draft.administrative_status,
            created_at: existing.file.created_at,
            updated_at: now,
            archived_at: None,
        },
    };
    let stored = repository.update_record(record)?;
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

fn to_view(record: PersonnelRecord, company: &Company) -> PersonnelFileView {
    PersonnelFileView {
        id: record.file.id,
        person_id: record.person.id,
        company_id: company.id.clone(),
        company_name: display_name(company),
        employee_number: record.file.employee_number,
        given_name: record.person.given_name,
        family_name: record.person.family_name,
        administrative_status: record.file.administrative_status.as_str().to_string(),
        created_at: record.file.created_at,
        updated_at: record.file.updated_at,
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
            let directory =
                std::env::temp_dir().join(format!("rh-system-personnel-{}", Uuid::new_v4()));
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

    fn file_write(
        given_name: &str,
        family_name: &str,
        employee_number: &str,
        status: &str,
    ) -> PersonnelFileWrite {
        PersonnelFileWrite {
            given_name: given_name.to_string(),
            family_name: family_name.to_string(),
            employee_number: employee_number.to_string(),
            administrative_status: status.to_string(),
        }
    }

    fn north_fixture() -> PersonnelFileWrite {
        file_write("Alex", "Rivera", "TN-001", "active")
    }

    fn south_fixture() -> PersonnelFileWrite {
        file_write("Pat", "Gómez", "ES-010", "inactive")
    }

    #[test]
    fn isolates_files_by_active_company_and_allows_same_number_elsewhere() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let north = create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let south = create_company(&repository, company_write("Estudio Sur", "", "")).unwrap();
        assert!(north.is_active);

        let created_north = create_personnel_file(&repository, north_fixture()).unwrap();
        assert_eq!(created_north.employee_number, "TN-001");
        assert_eq!(created_north.given_name, "Alex");
        assert_eq!(created_north.company_id, north.id);
        assert_eq!(created_north.company_name, "Norte");
        assert_ne!(created_north.id, created_north.person_id);

        set_active_company(&repository, &south.id).unwrap();
        let created_south =
            create_personnel_file(&repository, file_write("Sam", "Ortega", "TN-001", "active"))
                .unwrap();
        assert_eq!(created_south.employee_number, "TN-001");
        assert_eq!(created_south.company_id, south.id);
        assert_ne!(created_south.id, created_north.id);

        let south_list = list_personnel_files(&repository, None).unwrap();
        assert_eq!(south_list.len(), 1);
        assert_eq!(south_list[0].id, created_south.id);
        assert!(get_personnel_file(&repository, &created_north.id).is_err());

        set_active_company(&repository, &north.id).unwrap();
        let north_list = list_personnel_files(&repository, None).unwrap();
        assert_eq!(north_list.len(), 1);
        assert_eq!(north_list[0].id, created_north.id);
        assert_eq!(
            get_personnel_file(&repository, &created_south.id).unwrap_err(),
            AppError::PersonnelFileNotFound
        );
    }

    #[test]
    fn rejects_duplicate_employee_number_in_the_same_company() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        create_personnel_file(&repository, north_fixture()).unwrap();
        let error = create_personnel_file(&repository, north_fixture()).unwrap_err();
        assert_eq!(error, AppError::DuplicateEmployeeNumber);
        assert_eq!(list_personnel_files(&repository, None).unwrap().len(), 1);
    }

    #[test]
    fn searches_updates_and_survives_reopen() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let first = create_personnel_file(&repository, north_fixture()).unwrap();
        create_personnel_file(&repository, south_fixture()).unwrap();

        let by_number = list_personnel_files(&repository, Some("tn-001".to_string())).unwrap();
        assert_eq!(by_number.len(), 1);
        assert_eq!(by_number[0].id, first.id);

        let by_name = list_personnel_files(&repository, Some("gómez".to_string())).unwrap();
        assert_eq!(by_name.len(), 1);
        assert_eq!(by_name[0].employee_number, "ES-010");

        let none = list_personnel_files(&repository, Some("sin-coincidencia".to_string())).unwrap();
        assert!(none.is_empty());

        let updated = update_personnel_file(
            &repository,
            &first.id,
            file_write("Alex", "Rivera Soto", "TN-001", "inactive"),
        )
        .unwrap();
        assert_eq!(updated.family_name, "Rivera Soto");
        assert_eq!(updated.administrative_status, "inactive");
        assert_eq!(updated.created_at, first.created_at);
        assert_eq!(updated.person_id, first.person_id);

        drop(repository);
        let reopened = SqliteCompanyRepository::open(database.path()).unwrap();
        let listed = list_personnel_files(&reopened, None).unwrap();
        assert_eq!(listed.len(), 2);
        let restored = listed.iter().find(|item| item.id == first.id).unwrap();
        assert_eq!(restored.family_name, "Rivera Soto");
        assert_eq!(restored.administrative_status, "inactive");
        assert_eq!(restored.employee_number, "TN-001");
    }

    #[test]
    fn requires_an_active_company_and_ignores_missing_files() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let error = create_personnel_file(&repository, north_fixture()).unwrap_err();
        assert_eq!(error, AppError::ActiveCompanyRequired);

        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let missing = get_personnel_file(&repository, "missing").unwrap_err();
        assert_eq!(missing, AppError::PersonnelFileNotFound);
        let invalid =
            create_personnel_file(&repository, file_write("  ", "Rivera", "TN-001", "active"))
                .unwrap_err();
        assert_eq!(invalid, AppError::GivenNameRequired);
        assert!(list_personnel_files(&repository, None).unwrap().is_empty());
    }

    #[test]
    fn production_gate_blocks_personnel_use_cases() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let error =
            create_personnel_file_with_gate(&repository, north_fixture(), false).unwrap_err();
        assert_eq!(error.code(), "personnel_disabled_in_production");
        assert!(list_personnel_files_with_gate(&repository, None, false).is_err());
        assert!(get_personnel_file_with_gate(&repository, "any", false).is_err());
        assert!(
            update_personnel_file_with_gate(&repository, "any", north_fixture(), false).is_err()
        );
        assert!(list_personnel_files(&repository, None).unwrap().is_empty());
        personnel_operations_permitted(cfg!(debug_assertions)).unwrap();
    }

    #[test]
    fn duplicate_on_update_stays_in_the_same_company() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        create_company(
            &repository,
            company_write("Taller Norte", "Norte", "DEMO-0001"),
        )
        .unwrap();
        let first = create_personnel_file(&repository, north_fixture()).unwrap();
        let second = create_personnel_file(&repository, south_fixture()).unwrap();
        let error = update_personnel_file(
            &repository,
            &second.id,
            file_write("Pat", "Gómez", "TN-001", "inactive"),
        )
        .unwrap_err();
        assert_eq!(error, AppError::DuplicateEmployeeNumber);
        let unchanged = get_personnel_file(&repository, &first.id).unwrap();
        assert_eq!(unchanged.employee_number, "TN-001");
    }
}
