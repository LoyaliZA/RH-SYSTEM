use std::path::Path;
use std::time::Duration;

use rusqlite::Connection;

use crate::error::AppError;

const MIGRATIONS: &[(i64, &str)] = &[(1, include_str!("../../migrations/001_init.sql"))];

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
        assert_eq!(user_version(&connection).unwrap(), 1);
        drop(connection);

        let reopened = open_database(&database.path()).unwrap();
        assert!(foreign_keys_enabled(&reopened).unwrap());
        assert_eq!(user_version(&reopened).unwrap(), 1);

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
}
