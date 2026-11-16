use crate::domain::PersonnelRecord;
use crate::error::AppError;

pub(crate) trait PersonnelFileRepository {
    fn insert_record(&self, record: PersonnelRecord) -> Result<PersonnelRecord, AppError>;
    fn update_record(&self, record: PersonnelRecord) -> Result<PersonnelRecord, AppError>;
    fn list_for_company(
        &self,
        company_id: &str,
        query: Option<&str>,
    ) -> Result<Vec<PersonnelRecord>, AppError>;
    fn find_for_company(
        &self,
        company_id: &str,
        file_id: &str,
    ) -> Result<Option<PersonnelRecord>, AppError>;
    fn find_by_employee_number(
        &self,
        company_id: &str,
        employee_number: &str,
        excluding_file_id: Option<&str>,
    ) -> Result<Option<PersonnelRecord>, AppError>;
}
