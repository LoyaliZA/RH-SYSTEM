use serde::ser::SerializeStruct;
use serde::{Serialize, Serializer};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AppError {
    LegalNameRequired,
    LegalNameTooLong,
    TradeNameTooLong,
    TaxIdInvalid,
    CompanyNotFound,
    ActiveCompanyRequired,
    GivenNameRequired,
    GivenNameTooLong,
    FamilyNameRequired,
    FamilyNameTooLong,
    EmployeeNumberRequired,
    EmployeeNumberTooLong,
    EmployeeNumberInvalid,
    DuplicateEmployeeNumber,
    AdministrativeStatusInvalid,
    PersonnelFileNotFound,
    PersonnelDisabledInProduction,
    ForeignKeysDisabled,
    Migration(String),
    Database(String),
    Io(String),
}

impl AppError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::LegalNameRequired => "legal_name_required",
            Self::LegalNameTooLong => "legal_name_too_long",
            Self::TradeNameTooLong => "trade_name_too_long",
            Self::TaxIdInvalid => "tax_id_invalid",
            Self::CompanyNotFound => "company_not_found",
            Self::ActiveCompanyRequired => "active_company_required",
            Self::GivenNameRequired => "given_name_required",
            Self::GivenNameTooLong => "given_name_too_long",
            Self::FamilyNameRequired => "family_name_required",
            Self::FamilyNameTooLong => "family_name_too_long",
            Self::EmployeeNumberRequired => "employee_number_required",
            Self::EmployeeNumberTooLong => "employee_number_too_long",
            Self::EmployeeNumberInvalid => "employee_number_invalid",
            Self::DuplicateEmployeeNumber => "duplicate_employee_number",
            Self::AdministrativeStatusInvalid => "administrative_status_invalid",
            Self::PersonnelFileNotFound => "personnel_file_not_found",
            Self::PersonnelDisabledInProduction => "personnel_disabled_in_production",
            Self::ForeignKeysDisabled => "foreign_keys_disabled",
            Self::Migration(_) => "migration",
            Self::Database(_) => "database",
            Self::Io(_) => "io",
        }
    }

    pub fn message(&self) -> String {
        match self {
            Self::LegalNameRequired => "La razón social es obligatoria.".to_string(),
            Self::LegalNameTooLong => "La razón social supera 160 caracteres.".to_string(),
            Self::TradeNameTooLong => "El nombre comercial supera 160 caracteres.".to_string(),
            Self::TaxIdInvalid => {
                "El identificador fiscal solo puede incluir letras, números y guiones, con un máximo de 32 caracteres.".to_string()
            }
            Self::CompanyNotFound => "No se encontró la empresa.".to_string(),
            Self::ActiveCompanyRequired => {
                "No hay una empresa activa. Cree o active una empresa antes de operar expedientes."
                    .to_string()
            }
            Self::GivenNameRequired => "El nombre es obligatorio.".to_string(),
            Self::GivenNameTooLong => "El nombre supera 80 caracteres.".to_string(),
            Self::FamilyNameRequired => "Los apellidos son obligatorios.".to_string(),
            Self::FamilyNameTooLong => "Los apellidos superan 120 caracteres.".to_string(),
            Self::EmployeeNumberRequired => "El número de empleado es obligatorio.".to_string(),
            Self::EmployeeNumberTooLong => {
                "El número de empleado supera 32 caracteres.".to_string()
            }
            Self::EmployeeNumberInvalid => {
                "El número de empleado solo puede incluir letras, números y guiones.".to_string()
            }
            Self::DuplicateEmployeeNumber => {
                "Ya existe un expediente con ese número de empleado en la empresa activa."
                    .to_string()
            }
            Self::AdministrativeStatusInvalid => {
                "El estado administrativo no es válido.".to_string()
            }
            Self::PersonnelFileNotFound => {
                "No se encontró el expediente en la empresa activa.".to_string()
            }
            Self::PersonnelDisabledInProduction => {
                "Las operaciones de personal no están disponibles en compilaciones de producción mientras falten autenticación y autorización. Use una compilación de desarrollo con datos sintéticos.".to_string()
            }
            Self::ForeignKeysDisabled => {
                "La base de datos no tiene las claves foráneas activas.".to_string()
            }
            Self::Migration(detail) => format!("No se pudo migrar la base de datos. {detail}"),
            Self::Database(_) => "No se pudo leer o escribir la base de datos.".to_string(),
            Self::Io(_) => "No se pudo preparar el directorio de datos.".to_string(),
        }
    }

    pub(crate) fn database(error: impl ToString) -> Self {
        Self::Database(error.to_string())
    }

    pub(crate) fn io(error: impl ToString) -> Self {
        Self::Io(error.to_string())
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{}", self.message())
    }
}

impl std::error::Error for AppError {}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("code", self.code())?;
        state.serialize_field("message", &self.message())?;
        state.end()
    }
}
