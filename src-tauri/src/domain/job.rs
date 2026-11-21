use crate::error::AppError;

const MAX_JOB_CODE_LEN: usize = 32;
const MAX_JOB_NAME_LEN: usize = 120;
const MAX_JOB_DESCRIPTION_LEN: usize = 500;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum JobStatus {
    Active,
    Inactive,
}

impl JobStatus {
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
            _ => Err(AppError::JobStatusInvalid),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct JobDraft {
    pub code: String,
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Job {
    pub id: String,
    pub company_id: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub status: JobStatus,
    pub created_at: String,
    pub updated_at: String,
}

pub(crate) fn validate_job_draft(
    code: &str,
    name: &str,
    description: Option<&str>,
) -> Result<JobDraft, AppError> {
    Ok(JobDraft {
        code: normalize_code(code)?,
        name: normalize_required(
            name,
            MAX_JOB_NAME_LEN,
            AppError::JobNameRequired,
            AppError::JobNameTooLong,
        )?,
        description: normalize_optional(description)?,
    })
}

fn normalize_code(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(AppError::JobCodeRequired);
    }
    if trimmed.chars().count() > MAX_JOB_CODE_LEN {
        return Err(AppError::JobCodeTooLong);
    }
    let mut alphanumeric = 0;
    for character in trimmed.chars() {
        if character.is_ascii_alphanumeric() {
            alphanumeric += 1;
        } else if character != '-' {
            return Err(AppError::JobCodeInvalid);
        }
    }
    if alphanumeric == 0 {
        return Err(AppError::JobCodeInvalid);
    }
    Ok(trimmed.to_string())
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

fn normalize_optional(value: Option<&str>) -> Result<Option<String>, AppError> {
    let Some(value) = value else {
        return Ok(None);
    };
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Ok(None);
    }
    if trimmed.chars().count() > MAX_JOB_DESCRIPTION_LEN {
        return Err(AppError::JobDescriptionTooLong);
    }
    Ok(Some(trimmed.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_a_job_draft_and_drops_a_blank_description() {
        let draft = validate_job_draft("  op-01 ", "  Operación de piso  ", Some("  ")).unwrap();
        assert_eq!(draft.code, "op-01");
        assert_eq!(draft.name, "Operación de piso");
        assert_eq!(draft.description, None);
    }

    #[test]
    fn rejects_blank_invalid_and_oversized_job_fields() {
        assert_eq!(
            validate_job_draft("  ", "Operación", None).unwrap_err(),
            AppError::JobCodeRequired
        );
        assert_eq!(
            validate_job_draft("OP 01", "Operación", None).unwrap_err(),
            AppError::JobCodeInvalid
        );
        assert_eq!(
            validate_job_draft("---", "Operación", None).unwrap_err(),
            AppError::JobCodeInvalid
        );
        assert_eq!(
            validate_job_draft("OP-01", "  ", None).unwrap_err(),
            AppError::JobNameRequired
        );
        let code = format!("C{}", "1".repeat(32));
        assert_eq!(
            validate_job_draft(&code, "Operación", None).unwrap_err(),
            AppError::JobCodeTooLong
        );
        let name = "N".repeat(121);
        assert_eq!(
            validate_job_draft("OP-01", &name, None).unwrap_err(),
            AppError::JobNameTooLong
        );
        let description = "D".repeat(501);
        assert_eq!(
            validate_job_draft("OP-01", "Operación", Some(&description)).unwrap_err(),
            AppError::JobDescriptionTooLong
        );
    }

    #[test]
    fn parses_job_status() {
        assert_eq!(JobStatus::parse("active").unwrap(), JobStatus::Active);
        assert_eq!(JobStatus::parse(" inactive ").unwrap(), JobStatus::Inactive);
        assert_eq!(
            JobStatus::parse("archived").unwrap_err(),
            AppError::JobStatusInvalid
        );
    }
}
