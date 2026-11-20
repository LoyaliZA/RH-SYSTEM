use std::sync::Mutex;

use tauri::State;

use crate::domain::personnel_operations_permitted;
use crate::error::AppError;
use crate::persistence::SqliteCompanyRepository;
use crate::use_cases::{
    self, CompanyView, CompanyWrite, EmploymentView, EmploymentWrite, JobStatusWrite, JobView,
    JobWrite, PersonnelFileView, PersonnelFileWrite,
};

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

fn with_personnel_repository<T>(
    state: &AppState,
    action: impl FnOnce(&SqliteCompanyRepository) -> Result<T, AppError>,
) -> Result<T, AppError> {
    personnel_operations_permitted(cfg!(debug_assertions))?;
    with_repository(state, action)
}

#[tauri::command]
pub(crate) fn list_personnel_files(
    state: State<'_, AppState>,
    query: Option<String>,
) -> Result<Vec<PersonnelFileView>, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::list_personnel_files(repository, query)
    })
}

#[tauri::command]
pub(crate) fn get_personnel_file(
    state: State<'_, AppState>,
    id: String,
) -> Result<PersonnelFileView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::get_personnel_file(repository, &id)
    })
}

#[tauri::command]
pub(crate) fn create_personnel_file(
    state: State<'_, AppState>,
    input: PersonnelFileWrite,
) -> Result<PersonnelFileView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::create_personnel_file(repository, input)
    })
}

#[tauri::command]
pub(crate) fn update_personnel_file(
    state: State<'_, AppState>,
    id: String,
    input: PersonnelFileWrite,
) -> Result<PersonnelFileView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::update_personnel_file(repository, &id, input)
    })
}

#[tauri::command]
pub(crate) fn list_jobs(state: State<'_, AppState>) -> Result<Vec<JobView>, AppError> {
    with_personnel_repository(&state, use_cases::list_jobs)
}

#[tauri::command]
pub(crate) fn get_job(state: State<'_, AppState>, id: String) -> Result<JobView, AppError> {
    with_personnel_repository(&state, |repository| use_cases::get_job(repository, &id))
}

#[tauri::command]
pub(crate) fn create_job(state: State<'_, AppState>, input: JobWrite) -> Result<JobView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::create_job(repository, input)
    })
}

#[tauri::command]
pub(crate) fn update_job(
    state: State<'_, AppState>,
    id: String,
    input: JobWrite,
) -> Result<JobView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::update_job(repository, &id, input)
    })
}

#[tauri::command]
pub(crate) fn set_job_status(
    state: State<'_, AppState>,
    id: String,
    input: JobStatusWrite,
) -> Result<JobView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::set_job_status(repository, &id, input)
    })
}

#[tauri::command]
pub(crate) fn get_employment_for_file(
    state: State<'_, AppState>,
    personnel_file_id: String,
) -> Result<Option<EmploymentView>, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::get_employment_for_file(repository, &personnel_file_id)
    })
}

#[tauri::command]
pub(crate) fn create_employment_relationship(
    state: State<'_, AppState>,
    input: EmploymentWrite,
) -> Result<EmploymentView, AppError> {
    with_personnel_repository(&state, |repository| {
        use_cases::create_employment_relationship(repository, input)
    })
}
