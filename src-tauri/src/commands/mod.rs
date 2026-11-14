use std::sync::Mutex;

use tauri::State;

use crate::error::AppError;
use crate::persistence::SqliteCompanyRepository;
use crate::use_cases::{self, CompanyView, CompanyWrite};

pub(crate) struct AppState {
    pub repo: Mutex<SqliteCompanyRepository>,
}

fn with_repository<T>(
    state: &AppState,
    action: impl FnOnce(&SqliteCompanyRepository) -> Result<T, AppError>,
) -> Result<T, AppError> {
    let repository = state.repo.lock().map_err(|_| {
        AppError::Database("el acceso a la base de datos quedó interrumpido".to_string())
    })?;
    let result = action(&repository);
    if let Err(error) = &result
        && matches!(
            error,
            AppError::Database(_) | AppError::Io(_) | AppError::Migration(_)
        )
    {
        eprintln!("rh-system: {error:?}");
    }
    result
}

#[tauri::command]
pub(crate) fn list_companies(state: State<'_, AppState>) -> Result<Vec<CompanyView>, AppError> {
    with_repository(&state, use_cases::list_companies)
}

#[tauri::command]
pub(crate) fn create_company(
    state: State<'_, AppState>,
    input: CompanyWrite,
) -> Result<CompanyView, AppError> {
    with_repository(&state, |repository| {
        use_cases::create_company(repository, input)
    })
}

#[tauri::command]
pub(crate) fn update_company(
    state: State<'_, AppState>,
    id: String,
    input: CompanyWrite,
) -> Result<CompanyView, AppError> {
    with_repository(&state, |repository| {
        use_cases::update_company(repository, &id, input)
    })
}

#[tauri::command]
pub(crate) fn set_active_company(
    state: State<'_, AppState>,
    id: String,
) -> Result<CompanyView, AppError> {
    with_repository(&state, |repository| {
        use_cases::set_active_company(repository, &id)
    })
}
