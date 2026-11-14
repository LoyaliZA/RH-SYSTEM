use crate::domain::Company;
use crate::error::AppError;

pub(crate) trait CompanyRepository {
    fn insert(&self, company: Company) -> Result<Company, AppError>;
    fn update(&self, company: Company) -> Result<Company, AppError>;
    fn list(&self) -> Result<Vec<Company>, AppError>;
    fn find(&self, id: &str) -> Result<Option<Company>, AppError>;
    fn active_id(&self) -> Result<Option<String>, AppError>;
    fn set_active(&self, id: &str) -> Result<(), AppError>;
}
