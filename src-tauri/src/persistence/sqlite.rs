use std::path::Path;

use rusqlite::{OptionalExtension, params};

use super::repository::CompanyRepository;
use crate::domain::Company;
use crate::error::AppError;
use crate::infrastructure::open_database;

const ACTIVE_COMPANY_KEY: &str = "active_company_id";

pub(crate) struct SqliteCompanyRepository {
    connection: rusqlite::Connection,
}

impl SqliteCompanyRepository {
    pub(crate) fn open(path: &Path) -> Result<Self, AppError> {
        let connection = open_database(path)?;
        Ok(Self { connection })
    }
}

impl CompanyRepository for SqliteCompanyRepository {
    fn insert(&self, company: Company) -> Result<Company, AppError> {
        let transaction = self
            .connection
            .unchecked_transaction()
            .map_err(AppError::database)?;
        transaction
            .execute(
                "INSERT INTO companies (id, legal_name, trade_name, tax_id, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    company.id,
                    company.legal_name,
                    company.trade_name,
                    company.tax_id,
                    company.created_at,
                    company.updated_at,
                ],
            )
            .map_err(AppError::database)?;

        let active: Option<String> = transaction
            .query_row(
                "SELECT value FROM app_settings WHERE key = ?1",
                params![ACTIVE_COMPANY_KEY],
                |row| row.get(0),
            )
            .optional()
            .map_err(AppError::database)?;
        if active.is_none() {
            transaction
                .execute(
                    "INSERT INTO app_settings (key, value) VALUES (?1, ?2)",
                    params![ACTIVE_COMPANY_KEY, company.id],
                )
                .map_err(AppError::database)?;
        }
        transaction.commit().map_err(AppError::database)?;
        Ok(company)
    }

    fn update(&self, company: Company) -> Result<Company, AppError> {
        let changed = self
            .connection
            .execute(
                "UPDATE companies
                 SET legal_name = ?1, trade_name = ?2, tax_id = ?3, updated_at = ?4
                 WHERE id = ?5",
                params![
                    company.legal_name,
                    company.trade_name,
                    company.tax_id,
                    company.updated_at,
                    company.id,
                ],
            )
            .map_err(AppError::database)?;
        if changed == 0 {
            return Err(AppError::CompanyNotFound);
        }
        Ok(company)
    }

    fn list(&self) -> Result<Vec<Company>, AppError> {
        let mut statement = self
            .connection
            .prepare(
                "SELECT id, legal_name, trade_name, tax_id, created_at, updated_at
                 FROM companies
                 ORDER BY legal_name COLLATE NOCASE, id",
            )
            .map_err(AppError::database)?;
        let rows = statement
            .query_map([], map_company)
            .map_err(AppError::database)?;
        let mut companies = Vec::new();
        for row in rows {
            companies.push(row.map_err(AppError::database)?);
        }
        Ok(companies)
    }

    fn find(&self, id: &str) -> Result<Option<Company>, AppError> {
        self.connection
            .query_row(
                "SELECT id, legal_name, trade_name, tax_id, created_at, updated_at
                 FROM companies
                 WHERE id = ?1",
                params![id],
                map_company,
            )
            .optional()
            .map_err(AppError::database)
    }

    fn active_id(&self) -> Result<Option<String>, AppError> {
        let value: Option<String> = self
            .connection
            .query_row(
                "SELECT value FROM app_settings WHERE key = ?1",
                params![ACTIVE_COMPANY_KEY],
                |row| row.get(0),
            )
            .optional()
            .map_err(AppError::database)?;
        match value {
            Some(id) if self.find(&id)?.is_some() => Ok(Some(id)),
            _ => Ok(None),
        }
    }

    fn set_active(&self, id: &str) -> Result<(), AppError> {
        if self.find(id)?.is_none() {
            return Err(AppError::CompanyNotFound);
        }
        self.connection
            .execute(
                "INSERT INTO app_settings (key, value) VALUES (?1, ?2)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                params![ACTIVE_COMPANY_KEY, id],
            )
            .map_err(AppError::database)?;
        Ok(())
    }
}

fn map_company(row: &rusqlite::Row<'_>) -> rusqlite::Result<Company> {
    Ok(Company {
        id: row.get(0)?,
        legal_name: row.get(1)?,
        trade_name: row.get(2)?,
        tax_id: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
    })
}
