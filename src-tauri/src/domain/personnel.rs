use crate::error::AppError;

const MAX_GIVEN_NAME_LEN: usize = 80;
const MAX_FAMILY_NAME_LEN: usize = 120;
const MAX_EMPLOYEE_NUMBER_LEN: usize = 32;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum AdministrativeStatus {
    Active,
    Inactive,
}

impl AdministrativeStatus {
    pub(crate) fn as_str(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Inactive => "inactive",
        }
    }

    pub(crate) fn parse(value: &str) -> Result<Self, AppError> {
        match value.trim() {
            "active" => Ok(Self::Active),
            "inactive" => Ok(Self::Inactive),
            _ => Err(AppError::AdministrativeStatusInvalid),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct PersonnelDraft {
    pub given_name: String,
    pub family_name: String,
    pub employee_number: String,
    pub administrative_status: AdministrativeStatus,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Person {
    pub id: String,
    pub company_id: String,
    pub given_name: String,
    pub family_name: String,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct PersonnelFile {
    pub id: String,
    pub company_id: String,
    pub person_id: String,
    pub employee_number: String,
    pub administrative_status: AdministrativeStatus,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct PersonnelRecord {
    pub file: PersonnelFile,
    pub person: Person,
}

pub(crate) fn validate_draft(
    given_name: &str,
    family_name: &str,
    employee_number: &str,
    administrative_status: &str,
) -> Result<PersonnelDraft, AppError> {
    Ok(PersonnelDraft {
        given_name: normalize_required(
            given_name,
            MAX_GIVEN_NAME_LEN,
            AppError::GivenNameRequired,
            AppError::GivenNameTooLong,
        )?,
        family_name: normalize_required(
            family_name,
            MAX_FAMILY_NAME_LEN,
            AppError::FamilyNameRequired,
            AppError::FamilyNameTooLong,
        )?,
        employee_number: normalize_employee_number(employee_number)?,
        administrative_status: AdministrativeStatus::parse(administrative_status)?,
    })
}

pub(crate) fn like_pattern(query: &str) -> Option<String> {
    let trimmed = query.trim();
    if trimmed.is_empty() {
        return None;
    }
    let escaped = trimmed
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_");
    Some(format!("%{escaped}%"))
}

fn normalize_required(
    value: &str,
    max_len: usize,
    empty: AppError,
    too_long: AppError,
) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(empty);
    }
    if trimmed.chars().count() > max_len {
        return Err(too_long);
    }
    Ok(trimmed.to_string())
}

fn normalize_employee_number(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(AppError::EmployeeNumberRequired);
    }
    if trimmed.chars().count() > MAX_EMPLOYEE_NUMBER_LEN {
        return Err(AppError::EmployeeNumberTooLong);
    }
    let mut alphanumeric = 0;
    for character in trimmed.chars() {
        if character.is_ascii_alphanumeric() {
            alphanumeric += 1;
        } else if character != '-' {
            return Err(AppError::EmployeeNumberInvalid);
        }
    }
    if alphanumeric == 0 {
        return Err(AppError::EmployeeNumberInvalid);
    }
    Ok(trimmed.to_string())
}

pub(crate) fn personnel_operations_permitted(development_build: bool) -> Result<(), AppError> {
    if development_build {
        Ok(())
    } else {
        Err(AppError::PersonnelDisabledInProduction)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_and_accepts_a_synthetic_draft() {
        let draft = validate_draft("  Alex  ", "  Rivera  ", " tn-001 ", "active").unwrap();
        assert_eq!(draft.given_name, "Alex");
        assert_eq!(draft.family_name, "Rivera");
        assert_eq!(draft.employee_number, "tn-001");
        assert_eq!(draft.administrative_status, AdministrativeStatus::Active);
    }

    #[test]
    fn rejects_blank_required_fields() {
        assert_eq!(
            validate_draft("  ", "Rivera", "TN-001", "active").unwrap_err(),
            AppError::GivenNameRequired
        );
        assert_eq!(
            validate_draft("Alex", "  ", "TN-001", "active").unwrap_err(),
            AppError::FamilyNameRequired
        );
        assert_eq!(
            validate_draft("Alex", "Rivera", "  ", "active").unwrap_err(),
            AppError::EmployeeNumberRequired
        );
    }

    #[test]
    fn rejects_invalid_employee_number_and_status() {
        assert_eq!(
            validate_draft("Alex", "Rivera", "TN 001", "active").unwrap_err(),
            AppError::EmployeeNumberInvalid
        );
        assert_eq!(
            validate_draft("Alex", "Rivera", "---", "active").unwrap_err(),
            AppError::EmployeeNumberInvalid
        );
        assert_eq!(
            validate_draft("Alex", "Rivera", "TN-001", "hired").unwrap_err(),
            AppError::AdministrativeStatusInvalid
        );
    }

    #[test]
    fn rejects_oversized_fields() {
        let given = "A".repeat(81);
        assert_eq!(
            validate_draft(&given, "Rivera", "TN-001", "active").unwrap_err(),
            AppError::GivenNameTooLong
        );
        let family = "B".repeat(121);
        assert_eq!(
            validate_draft("Alex", &family, "TN-001", "active").unwrap_err(),
            AppError::FamilyNameTooLong
        );
        let number = format!("N{}", "1".repeat(32));
        assert_eq!(
            validate_draft("Alex", "Rivera", &number, "active").unwrap_err(),
            AppError::EmployeeNumberTooLong
        );
    }

    #[test]
    fn like_pattern_escapes_wildcards() {
        assert_eq!(like_pattern("  "), None);
        assert_eq!(like_pattern("tn_001").as_deref(), Some("%tn\\_001%"));
        assert_eq!(like_pattern("100%").as_deref(), Some("%100\\%%"));
    }

    #[test]
    fn production_gate_blocks_release_builds() {
        let error = personnel_operations_permitted(false).unwrap_err();
        assert_eq!(error.code(), "personnel_disabled_in_production");
        personnel_operations_permitted(true).unwrap();
    }
}
