use rusqlite::{OptionalExtension, params};

use super::personnel::PersonnelFileRepository;
use super::sqlite::SqliteCompanyRepository;
use crate::domain::{AdministrativeStatus, Person, PersonnelFile, PersonnelRecord};
use crate::error::AppError;

impl PersonnelFileRepository for SqliteCompanyRepository {
    fn insert_record(&self, record: PersonnelRecord) -> Result<PersonnelRecord, AppError> {
        let transaction = self
            .connection()
            .unchecked_transaction()
            .map_err(AppError::database)?;
        transaction
            .execute(
                "INSERT INTO people (
                    id, company_id, given_name, family_name, created_at, updated_at, archived_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    record.person.id,
                    record.person.company_id,
                    record.person.given_name,
                    record.person.family_name,
                    record.person.created_at,
                    record.person.updated_at,
                    record.person.archived_at,
                ],
            )
            .map_err(map_write_error)?;
        transaction
            .execute(
                "INSERT INTO personnel_files (
                    id, company_id, person_id, employee_number, administrative_status,
                    created_at, updated_at, archived_at
                 ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    record.file.id,
                    record.file.company_id,
                    record.file.person_id,
                    record.file.employee_number,
                    record.file.administrative_status.as_str(),
                    record.file.created_at,
                    record.file.updated_at,
                    record.file.archived_at,
                ],
            )
            .map_err(map_write_error)?;
        transaction.commit().map_err(AppError::database)?;
        Ok(record)
    }

    fn update_record(&self, record: PersonnelRecord) -> Result<PersonnelRecord, AppError> {
        let transaction = self
            .connection()
            .unchecked_transaction()
            .map_err(AppError::database)?;
        let people_changed = transaction
            .execute(
                "UPDATE people
                 SET given_name = ?1, family_name = ?2, updated_at = ?3
                 WHERE id = ?4 AND company_id = ?5 AND archived_at IS NULL",
                params![
                    record.person.given_name,
                    record.person.family_name,
                    record.person.updated_at,
                    record.person.id,
                    record.person.company_id,
                ],
            )
            .map_err(map_write_error)?;
        let files_changed = transaction
            .execute(
                "UPDATE personnel_files
                 SET employee_number = ?1, administrative_status = ?2, updated_at = ?3
                 WHERE id = ?4 AND company_id = ?5 AND archived_at IS NULL",
                params![
                    record.file.employee_number,
                    record.file.administrative_status.as_str(),
                    record.file.updated_at,
                    record.file.id,
                    record.file.company_id,
                ],
            )
            .map_err(map_write_error)?;
        if people_changed == 0 || files_changed == 0 {
            return Err(AppError::PersonnelFileNotFound);
        }
        transaction.commit().map_err(AppError::database)?;
        Ok(record)
    }

    fn list_for_company(
        &self,
        company_id: &str,
        query: Option<&str>,
    ) -> Result<Vec<PersonnelRecord>, AppError> {
        let sql = match query {
            Some(_) => {
                "SELECT
                    f.id, f.company_id, f.person_id, f.employee_number, f.administrative_status,
                    f.created_at, f.updated_at, f.archived_at,
                    p.id, p.company_id, p.given_name, p.family_name,
                    p.created_at, p.updated_at, p.archived_at
                 FROM personnel_files f
                 INNER JOIN people p ON p.id = f.person_id
                 WHERE f.company_id = ?1
                   AND p.company_id = ?1
                   AND f.archived_at IS NULL
                   AND p.archived_at IS NULL
                   AND (
                        f.employee_number LIKE ?2 ESCAPE '\\'
                        OR p.given_name LIKE ?2 ESCAPE '\\'
                        OR p.family_name LIKE ?2 ESCAPE '\\'
                        OR (p.given_name || ' ' || p.family_name) LIKE ?2 ESCAPE '\\'
                   )
                 ORDER BY p.family_name COLLATE NOCASE, p.given_name COLLATE NOCASE,
                          f.employee_number COLLATE NOCASE, f.id"
            }
            None => {
                "SELECT
                    f.id, f.company_id, f.person_id, f.employee_number, f.administrative_status,
                    f.created_at, f.updated_at, f.archived_at,
                    p.id, p.company_id, p.given_name, p.family_name,
                    p.created_at, p.updated_at, p.archived_at
                 FROM personnel_files f
                 INNER JOIN people p ON p.id = f.person_id
                 WHERE f.company_id = ?1
                   AND p.company_id = ?1
                   AND f.archived_at IS NULL
                   AND p.archived_at IS NULL
                 ORDER BY p.family_name COLLATE NOCASE, p.given_name COLLATE NOCASE,
                          f.employee_number COLLATE NOCASE, f.id"
            }
        };
        let mut statement = self.connection().prepare(sql).map_err(AppError::database)?;
        let mapped = match query {
            Some(pattern) => statement
                .query_map(params![company_id, pattern], map_record)
                .map_err(AppError::database)?,
            None => statement
                .query_map(params![company_id], map_record)
                .map_err(AppError::database)?,
        };
        let mut records = Vec::new();
        for row in mapped {
            records.push(row.map_err(AppError::database)?);
        }
        Ok(records)
    }

    fn find_for_company(
        &self,
        company_id: &str,
        file_id: &str,
    ) -> Result<Option<PersonnelRecord>, AppError> {
        self.connection()
            .query_row(
                "SELECT
                    f.id, f.company_id, f.person_id, f.employee_number, f.administrative_status,
                    f.created_at, f.updated_at, f.archived_at,
                    p.id, p.company_id, p.given_name, p.family_name,
                    p.created_at, p.updated_at, p.archived_at
                 FROM personnel_files f
                 INNER JOIN people p ON p.id = f.person_id
                 WHERE f.id = ?1
                   AND f.company_id = ?2
                   AND p.company_id = ?2
                   AND f.archived_at IS NULL
                   AND p.archived_at IS NULL",
                params![file_id, company_id],
                map_record,
            )
            .optional()
            .map_err(AppError::database)
    }

    fn find_by_employee_number(
        &self,
        company_id: &str,
        employee_number: &str,
        excluding_file_id: Option<&str>,
    ) -> Result<Option<PersonnelRecord>, AppError> {
        self.connection()
            .query_row(
                "SELECT
                    f.id, f.company_id, f.person_id, f.employee_number, f.administrative_status,
                    f.created_at, f.updated_at, f.archived_at,
                    p.id, p.company_id, p.given_name, p.family_name,
                    p.created_at, p.updated_at, p.archived_at
                 FROM personnel_files f
                 INNER JOIN people p ON p.id = f.person_id
                 WHERE f.company_id = ?1
                   AND p.company_id = ?1
                   AND f.employee_number = ?2 COLLATE NOCASE
                   AND f.archived_at IS NULL
                   AND p.archived_at IS NULL
                   AND (?3 IS NULL OR f.id != ?3)",
                params![company_id, employee_number, excluding_file_id],
                map_record,
            )
            .optional()
            .map_err(AppError::database)
    }
}

fn map_record(row: &rusqlite::Row<'_>) -> rusqlite::Result<PersonnelRecord> {
    let status: String = row.get(4)?;
    let administrative_status = AdministrativeStatus::parse(&status).map_err(|error| {
        rusqlite::Error::FromSqlConversionFailure(4, rusqlite::types::Type::Text, Box::new(error))
    })?;
    Ok(PersonnelRecord {
        file: PersonnelFile {
            id: row.get(0)?,
            company_id: row.get(1)?,
            person_id: row.get(2)?,
            employee_number: row.get(3)?,
            administrative_status,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
            archived_at: row.get(7)?,
        },
        person: Person {
            id: row.get(8)?,
            company_id: row.get(9)?,
            given_name: row.get(10)?,
            family_name: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
            archived_at: row.get(14)?,
        },
    })
}

fn map_write_error(error: rusqlite::Error) -> AppError {
    if is_unique_violation(&error) {
        AppError::DuplicateEmployeeNumber
    } else {
        AppError::database(error)
    }
}

fn is_unique_violation(error: &rusqlite::Error) -> bool {
    matches!(
        error,
        rusqlite::Error::SqliteFailure(info, _)
            if info.code == rusqlite::ErrorCode::ConstraintViolation
    )
}
