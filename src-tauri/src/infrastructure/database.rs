use std::path::Path;
use std::time::Duration;

use rusqlite::Connection;

use crate::error::AppError;

const MIGRATIONS: &[(i64, &str)] = &[
    (1, include_str!("../../migrations/001_init.sql")),
    (2, include_str!("../../migrations/002_personnel.sql")),
    (3, include_str!("../../migrations/003_jobs_employment.sql")),
];

pub(crate) fn open_database(path: &Path) -> Result<Connection, AppError> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(AppError::io)?;
    }

    let connection = Connection::open(path).map_err(AppError::database)?;
    connection
        .pragma_update(None, "foreign_keys", "ON")
        .map_err(AppError::database)?;
    connection
        .busy_timeout(Duration::from_secs(5))
        .map_err(AppError::database)?;
    connection
        .pragma_update(None, "journal_mode", "WAL")
        .map_err(AppError::database)?;

    let foreign_keys: i64 = connection
        .pragma_query_value(None, "foreign_keys", |row| row.get(0))
        .map_err(AppError::database)?;
    if foreign_keys != 1 {
        return Err(AppError::ForeignKeysDisabled);
    }

    migrate(&connection)?;
    Ok(connection)
}

fn migrate(connection: &Connection) -> Result<(), AppError> {
    let latest = MIGRATIONS.last().map(|(version, _)| *version).unwrap_or(0);
    let mut current: i64 = connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .map_err(AppError::database)?;
    if current > latest {
        return Err(AppError::Migration(format!(
            "la versión {current} es más nueva que la versión soportada {latest}"
        )));
    }

    for (version, sql) in MIGRATIONS {
        if current >= *version {
            continue;
        }
        let transaction = connection
            .unchecked_transaction()
            .map_err(AppError::database)?;
        transaction.execute_batch(sql).map_err(|error| {
            AppError::Migration(format!("falló la migración {version}: {error}"))
        })?;
        transaction
            .pragma_update(None, "user_version", *version)
            .map_err(AppError::database)?;
        transaction.commit().map_err(AppError::database)?;
        current = *version;
    }

    Ok(())
}

#[cfg(test)]
pub(crate) fn user_version(connection: &Connection) -> Result<i64, AppError> {
    connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .map_err(AppError::database)
}

#[cfg(test)]
pub(crate) fn foreign_keys_enabled(connection: &Connection) -> Result<bool, AppError> {
    let value: i64 = connection
        .pragma_query_value(None, "foreign_keys", |row| row.get(0))
        .map_err(AppError::database)?;
    Ok(value == 1)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    struct TempDatabase {
        directory: std::path::PathBuf,
    }

    impl TempDatabase {
        fn new() -> Self {
            let stamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let directory = std::env::temp_dir().join(format!("rh-system-db-{stamp}"));
            fs::create_dir_all(&directory).unwrap();
            Self { directory }
        }

        fn path(&self) -> std::path::PathBuf {
            self.directory.join("rh-system.sqlite")
        }
    }

    impl Drop for TempDatabase {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.directory);
        }
    }

    #[test]
    fn migration_is_idempotent_and_foreign_keys_stay_on() {
        let database = TempDatabase::new();
        let connection = open_database(&database.path()).unwrap();
        assert!(foreign_keys_enabled(&connection).unwrap());
        assert_eq!(user_version(&connection).unwrap(), 3);
        drop(connection);

        let reopened = open_database(&database.path()).unwrap();
        assert!(foreign_keys_enabled(&reopened).unwrap());
        assert_eq!(user_version(&reopened).unwrap(), 3);

        reopened
            .execute_batch(
                "CREATE TABLE fk_probe (
                    company_id TEXT NOT NULL REFERENCES companies(id)
                )",
            )
            .unwrap();
        let rejected = reopened.execute("INSERT INTO fk_probe (company_id) VALUES ('missing')", []);
        assert!(rejected.is_err());
    }

    #[test]
    fn migrates_existing_v1_database_without_losing_companies_or_seeding_files() {
        let database = TempDatabase::new();
        let path = database.path();
        let connection = Connection::open(&path).unwrap();
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .unwrap();
        connection
            .execute_batch(include_str!("../../migrations/001_init.sql"))
            .unwrap();
        connection.pragma_update(None, "user_version", 1).unwrap();
        connection
            .execute(
                "INSERT INTO companies (id, legal_name, trade_name, tax_id, created_at, updated_at)
                 VALUES (
                    'company-a',
                    'Taller Norte',
                    'Norte',
                    'DEMO-0001',
                    '2026-11-14T00:00:00Z',
                    '2026-11-14T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        drop(connection);

        let migrated = open_database(&path).unwrap();
        assert_eq!(user_version(&migrated).unwrap(), 3);
        let legal_name: String = migrated
            .query_row(
                "SELECT legal_name FROM companies WHERE id = 'company-a'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(legal_name, "Taller Norte");
        let people: i64 = migrated
            .query_row("SELECT COUNT(*) FROM people", [], |row| row.get(0))
            .unwrap();
        let files: i64 = migrated
            .query_row("SELECT COUNT(*) FROM personnel_files", [], |row| row.get(0))
            .unwrap();
        let jobs: i64 = migrated
            .query_row("SELECT COUNT(*) FROM jobs", [], |row| row.get(0))
            .unwrap();
        let relationships: i64 = migrated
            .query_row("SELECT COUNT(*) FROM employment_relationships", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(people, 0);
        assert_eq!(files, 0);
        assert_eq!(jobs, 0);
        assert_eq!(relationships, 0);

        let rejected = migrated.execute(
            "INSERT INTO personnel_files (
                id, company_id, person_id, employee_number, administrative_status,
                created_at, updated_at, archived_at
             ) VALUES ('file-1', 'missing', 'person-1', 'TN-001', 'active', 't', 't', NULL)",
            [],
        );
        assert!(rejected.is_err());
    }

    #[test]
    fn migrates_f21_database_without_losing_files_or_seeding_jobs() {
        let database = TempDatabase::new();
        let path = database.path();
        let connection = Connection::open(&path).unwrap();
        connection
            .pragma_update(None, "foreign_keys", "ON")
            .unwrap();
        connection
            .execute_batch(include_str!("../../migrations/001_init.sql"))
            .unwrap();
        connection
            .execute_batch(include_str!("../../migrations/002_personnel.sql"))
            .unwrap();
        connection.pragma_update(None, "user_version", 2).unwrap();
        connection
            .execute(
                "INSERT INTO companies (id, legal_name, trade_name, tax_id, created_at, updated_at)
                 VALUES (
                    'company-a', 'Taller Norte', 'Norte', 'DEMO-0001',
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO companies (id, legal_name, trade_name, tax_id, created_at, updated_at)
                 VALUES (
                    'company-b', 'Estudio Sur', NULL, NULL,
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO people (
                    id, company_id, given_name, family_name, created_at, updated_at, archived_at
                 ) VALUES (
                    'person-a', 'company-a', 'Alex', 'Rivera',
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z', NULL
                 )",
                [],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO personnel_files (
                    id, company_id, person_id, employee_number, administrative_status,
                    created_at, updated_at, archived_at
                 ) VALUES (
                    'file-a', 'company-a', 'person-a', 'TN-001', 'active',
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z', NULL
                 )",
                [],
            )
            .unwrap();
        drop(connection);

        let migrated = open_database(&path).unwrap();
        assert_eq!(user_version(&migrated).unwrap(), 3);
        let employee_number: String = migrated
            .query_row(
                "SELECT employee_number FROM personnel_files WHERE id = 'file-a'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(employee_number, "TN-001");
        let jobs: i64 = migrated
            .query_row("SELECT COUNT(*) FROM jobs", [], |row| row.get(0))
            .unwrap();
        let relationships: i64 = migrated
            .query_row("SELECT COUNT(*) FROM employment_relationships", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(jobs, 0);
        assert_eq!(relationships, 0);

        migrated
            .execute(
                "INSERT INTO jobs (
                    id, company_id, code, name, description, status, created_at, updated_at
                 ) VALUES (
                    'job-b', 'company-b', 'OP-01', 'Operación', NULL, 'active',
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        migrated
            .execute(
                "INSERT INTO employment_relationships (
                    id, company_id, personnel_file_id, started_on, ended_on, created_at, updated_at
                 ) VALUES (
                    'rel-a', 'company-a', 'file-a', '2026-11-16', NULL,
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        let cross_company = migrated.execute(
            "INSERT INTO job_assignments (
                id, company_id, employment_relationship_id, job_id, effective_on, ended_on,
                created_at, updated_at
             ) VALUES (
                'asg-a', 'company-a', 'rel-a', 'job-b', '2026-11-16', NULL,
                '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
             )",
            [],
        );
        assert!(cross_company.is_err());

        migrated
            .execute(
                "INSERT INTO jobs (
                    id, company_id, code, name, description, status, created_at, updated_at
                 ) VALUES (
                    'job-a', 'company-a', 'OP-01', 'Operación', NULL, 'active',
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        migrated
            .execute(
                "INSERT INTO job_assignments (
                    id, company_id, employment_relationship_id, job_id, effective_on, ended_on,
                    created_at, updated_at
                 ) VALUES (
                    'asg-a', 'company-a', 'rel-a', 'job-a', '2026-11-16', NULL,
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        let duplicate_code = migrated.execute(
            "INSERT INTO jobs (
                id, company_id, code, name, description, status, created_at, updated_at
             ) VALUES (
                'job-a2', 'company-a', 'op-01', 'Otra operación', NULL, 'active',
                '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
             )",
            [],
        );
        assert!(duplicate_code.is_err());
        let second_open = migrated.execute(
            "INSERT INTO employment_relationships (
                id, company_id, personnel_file_id, started_on, ended_on, created_at, updated_at
             ) VALUES (
                'rel-a2', 'company-a', 'file-a', '2026-12-01', NULL,
                '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
             )",
            [],
        );
        assert!(second_open.is_err());
        migrated
            .execute(
                "UPDATE employment_relationships
                 SET ended_on = '2026-12-01'
                 WHERE id = 'rel-a'",
                [],
            )
            .unwrap();
        migrated
            .execute(
                "UPDATE job_assignments
                 SET ended_on = '2026-12-01'
                 WHERE id = 'asg-a'",
                [],
            )
            .unwrap();
        migrated
            .execute(
                "INSERT INTO employment_relationships (
                    id, company_id, personnel_file_id, started_on, ended_on, created_at, updated_at
                 ) VALUES (
                    'rel-a2', 'company-a', 'file-a', '2027-01-01', NULL,
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        migrated
            .execute(
                "INSERT INTO job_assignments (
                    id, company_id, employment_relationship_id, job_id, effective_on, ended_on,
                    created_at, updated_at
                 ) VALUES (
                    'asg-a2', 'company-a', 'rel-a2', 'job-a', '2027-01-01', NULL,
                    '2026-11-16T00:00:00Z', '2026-11-16T00:00:00Z'
                 )",
                [],
            )
            .unwrap();
        let removed_job = migrated.execute("DELETE FROM jobs WHERE id = 'job-a'", []);
        assert!(removed_job.is_err());
        let kept: String = migrated
            .query_row(
                "SELECT employee_number FROM personnel_files WHERE id = 'file-a'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(kept, "TN-001");
    }
}
