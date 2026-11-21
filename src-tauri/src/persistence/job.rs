use crate::domain::Job;
use crate::error::AppError;

pub(crate) trait JobRepository {
    fn insert_job(&self, job: Job) -> Result<Job, AppError>;
    fn update_job(&self, job: Job) -> Result<Job, AppError>;
    fn set_job_status(&self, job: Job) -> Result<Job, AppError>;
    fn list_jobs(&self, company_id: &str) -> Result<Vec<Job>, AppError>;
    fn find_job(&self, company_id: &str, job_id: &str) -> Result<Option<Job>, AppError>;
    fn find_job_by_code(
        &self,
        company_id: &str,
        code: &str,
        excluding_job_id: Option<&str>,
    ) -> Result<Option<Job>, AppError>;
}
