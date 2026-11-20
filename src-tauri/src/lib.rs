mod commands;
mod domain;
mod error;
mod infrastructure;
mod persistence;
mod use_cases;

use std::sync::Mutex;

use tauri::Manager;

use commands::AppState;
use persistence::SqliteCompanyRepository;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let directory = app.path().app_data_dir()?;
            let path = directory.join("rh-system.sqlite");
            #[cfg(debug_assertions)]
            eprintln!("RH System database: {}", path.display());
            let repository = SqliteCompanyRepository::open(&path)
                .map_err(|error| std::io::Error::other(error.message()))?;
            app.manage(AppState {
                repo: Mutex::new(repository),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_companies,
            commands::create_company,
            commands::update_company,
            commands::set_active_company,
            commands::list_personnel_files,
            commands::get_personnel_file,
            commands::create_personnel_file,
            commands::update_personnel_file,
            commands::list_jobs,
            commands::get_job,
            commands::create_job,
            commands::update_job,
            commands::set_job_status,
            commands::get_employment_for_file,
            commands::create_employment_relationship,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
