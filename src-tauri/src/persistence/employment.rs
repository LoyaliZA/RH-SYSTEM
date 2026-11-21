use crate::domain::{EmploymentRelationship, JobAssignment};
use crate::error::AppError;

pub(crate) struct StoredEmployment {
    pub relationship: EmploymentRelationship,
    pub assignment: JobAssignment,
    pub job_code: String,
    pub job_name: String,
    pub job_status: String,
}

pub(crate) trait EmploymentRepository {
    fn insert_initial_employment(
        &self,
        relationship: EmploymentRelationship,
        assignment: JobAssignment,
    ) -> Result<(), AppError>;
    fn find_open_employment(
        &self,
        company_id: &str,
        personnel_file_id: &str,
    ) -> Result<Option<StoredEmployment>, AppError>;
}
