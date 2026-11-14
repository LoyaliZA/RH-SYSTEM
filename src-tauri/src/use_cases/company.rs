use chrono::{SecondsFormat, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::{Company, display_name, validate_draft};
use crate::error::AppError;
use crate::persistence::CompanyRepository;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CompanyWrite {
    pub legal_name: String,
    pub trade_name: Option<String>,
    pub tax_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CompanyView {
    pub id: String,
    pub legal_name: String,
    pub trade_name: Option<String>,
    pub tax_id: Option<String>,
    pub display_name: String,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

pub(crate) fn list_companies(
    repository: &impl CompanyRepository,
) -> Result<Vec<CompanyView>, AppError> {
    let active_id = repository.active_id()?;
    let companies = repository.list()?;
    Ok(companies
        .into_iter()
        .map(|company| to_view(company, active_id.as_deref()))
        .collect())
}

pub(crate) fn create_company(
    repository: &impl CompanyRepository,
    input: CompanyWrite,
) -> Result<CompanyView, AppError> {
    let draft = validate_draft(
        &input.legal_name,
        input.trade_name.as_deref().unwrap_or(""),
        input.tax_id.as_deref().unwrap_or(""),
    )?;
    let now = timestamp();
    let company = Company {
        id: Uuid::new_v4().to_string(),
        legal_name: draft.legal_name,
        trade_name: draft.trade_name,
        tax_id: draft.tax_id,
        created_at: now.clone(),
        updated_at: now,
    };
    let stored = repository.insert(company)?;
    let active_id = repository.active_id()?;
    Ok(to_view(stored, active_id.as_deref()))
}

pub(crate) fn update_company(
    repository: &impl CompanyRepository,
    id: &str,
    input: CompanyWrite,
) -> Result<CompanyView, AppError> {
    let existing = repository.find(id)?.ok_or(AppError::CompanyNotFound)?;
    let draft = validate_draft(
        &input.legal_name,
        input.trade_name.as_deref().unwrap_or(""),
        input.tax_id.as_deref().unwrap_or(""),
    )?;
    let company = Company {
        id: existing.id,
        legal_name: draft.legal_name,
        trade_name: draft.trade_name,
        tax_id: draft.tax_id,
        created_at: existing.created_at,
        updated_at: timestamp(),
    };
    let stored = repository.update(company)?;
    let active_id = repository.active_id()?;
    Ok(to_view(stored, active_id.as_deref()))
}

pub(crate) fn set_active_company(
    repository: &impl CompanyRepository,
    id: &str,
) -> Result<CompanyView, AppError> {
    repository.set_active(id)?;
    let company = repository.find(id)?.ok_or(AppError::CompanyNotFound)?;
    Ok(to_view(company, Some(id)))
}

fn to_view(company: Company, active_id: Option<&str>) -> CompanyView {
    let is_active = active_id.is_some_and(|id| id == company.id);
    let name = display_name(&company);
    CompanyView {
        id: company.id,
        legal_name: company.legal_name,
        trade_name: company.trade_name,
        tax_id: company.tax_id,
        display_name: name,
        is_active,
        created_at: company.created_at,
        updated_at: company.updated_at,
    }
}

fn timestamp() -> String {
    Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::SqliteCompanyRepository;
    use std::fs;
    use std::path::{Path, PathBuf};

    struct TempDatabase {
        directory: PathBuf,
        path: PathBuf,
    }

    impl TempDatabase {
        fn new() -> Self {
            let directory = std::env::temp_dir().join(format!("rh-system-{}", Uuid::new_v4()));
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

    fn write(legal_name: &str, trade_name: &str, tax_id: &str) -> CompanyWrite {
        CompanyWrite {
            legal_name: legal_name.to_string(),
            trade_name: Some(trade_name.to_string()),
            tax_id: Some(tax_id.to_string()),
        }
    }

    #[test]
    fn creates_reads_updates_and_survives_reopen() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        assert!(list_companies(&repository).unwrap().is_empty());

        let created = create_company(
            &repository,
            write("  Taller Norte  ", " Norte ", " demo-0001 "),
        )
        .unwrap();
        assert_eq!(created.legal_name, "Taller Norte");
        assert_eq!(created.trade_name.as_deref(), Some("Norte"));
        assert_eq!(created.tax_id.as_deref(), Some("DEMO-0001"));
        assert!(created.is_active);
        assert_eq!(created.display_name, "Norte");

        let updated = update_company(
            &repository,
            &created.id,
            write("Taller Norte Actualizado", "", ""),
        )
        .unwrap();
        assert_eq!(updated.legal_name, "Taller Norte Actualizado");
        assert_eq!(updated.trade_name, None);
        assert_eq!(updated.tax_id, None);
        assert_eq!(updated.display_name, "Taller Norte Actualizado");
        assert_eq!(updated.created_at, created.created_at);
        assert!(updated.is_active);

        drop(repository);
        let reopened = SqliteCompanyRepository::open(database.path()).unwrap();
        let listed = list_companies(&reopened).unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].id, created.id);
        assert_eq!(listed[0].legal_name, "Taller Norte Actualizado");
        assert!(listed[0].is_active);
    }

    #[test]
    fn updating_legal_name_keeps_trade_name_and_tax_id() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let created =
            create_company(&repository, write("Taller Norte", "Norte", "DEMO-0001")).unwrap();

        let updated = update_company(
            &repository,
            &created.id,
            write("Taller Norte Actualizado", "Norte", "DEMO-0001"),
        )
        .unwrap();
        assert_eq!(updated.legal_name, "Taller Norte Actualizado");
        assert_eq!(updated.trade_name.as_deref(), Some("Norte"));
        assert_eq!(updated.tax_id.as_deref(), Some("DEMO-0001"));
        assert_eq!(updated.display_name, "Norte");
        assert_eq!(updated.created_at, created.created_at);

        drop(repository);
        let reopened = SqliteCompanyRepository::open(database.path()).unwrap();
        let listed = list_companies(&reopened).unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].legal_name, "Taller Norte Actualizado");
        assert_eq!(listed[0].trade_name.as_deref(), Some("Norte"));
        assert_eq!(listed[0].tax_id.as_deref(), Some("DEMO-0001"));
        assert_eq!(listed[0].display_name, "Norte");
        assert!(listed[0].is_active);
    }

    #[test]
    fn second_company_does_not_replace_the_active_one() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let first = create_company(&repository, write("Alfa", "", "")).unwrap();
        let second = create_company(&repository, write("Beta", "Beta Comercial", "")).unwrap();
        assert!(first.is_active);
        assert!(!second.is_active);

        let activated = set_active_company(&repository, &second.id).unwrap();
        assert!(activated.is_active);
        assert_eq!(activated.display_name, "Beta Comercial");

        let listed = list_companies(&repository).unwrap();
        let alfa = listed
            .iter()
            .find(|company| company.id == first.id)
            .unwrap();
        let beta = listed
            .iter()
            .find(|company| company.id == second.id)
            .unwrap();
        assert!(!alfa.is_active);
        assert!(beta.is_active);
    }

    #[test]
    fn rejects_invalid_company_without_writing() {
        let database = TempDatabase::new();
        let repository = SqliteCompanyRepository::open(database.path()).unwrap();
        let error = create_company(&repository, write("   ", "", "")).unwrap_err();
        assert_eq!(error.code(), "legal_name_required");
        assert!(list_companies(&repository).unwrap().is_empty());

        let missing =
            update_company(&repository, "missing", write("Taller Norte", "", "")).unwrap_err();
        assert_eq!(missing, AppError::CompanyNotFound);
        let inactive = set_active_company(&repository, "missing").unwrap_err();
        assert_eq!(inactive, AppError::CompanyNotFound);
    }
}
