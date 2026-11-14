use crate::error::AppError;

const MAX_NAME_LEN: usize = 160;
const MAX_TAX_ID_LEN: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct CompanyDraft {
    pub legal_name: String,
    pub trade_name: Option<String>,
    pub tax_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Company {
    pub id: String,
    pub legal_name: String,
    pub trade_name: Option<String>,
    pub tax_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub(crate) fn display_name(company: &Company) -> String {
    company
        .trade_name
        .clone()
        .filter(|name| !name.is_empty())
        .unwrap_or_else(|| company.legal_name.clone())
}

pub(crate) fn validate_draft(
    legal_name: &str,
    trade_name: &str,
    tax_id: &str,
) -> Result<CompanyDraft, AppError> {
    let legal_name = normalize_required_name(legal_name)?;
    let trade_name = normalize_optional_name(trade_name)?;
    let tax_id = normalize_tax_id(tax_id)?;
    Ok(CompanyDraft {
        legal_name,
        trade_name,
        tax_id,
    })
}

fn normalize_required_name(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Err(AppError::LegalNameRequired);
    }
    if trimmed.chars().count() > MAX_NAME_LEN {
        return Err(AppError::LegalNameTooLong);
    }
    Ok(trimmed.to_string())
}

fn normalize_optional_name(value: &str) -> Result<Option<String>, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Ok(None);
    }
    if trimmed.chars().count() > MAX_NAME_LEN {
        return Err(AppError::TradeNameTooLong);
    }
    Ok(Some(trimmed.to_string()))
}

fn normalize_tax_id(value: &str) -> Result<Option<String>, AppError> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return Ok(None);
    }
    let normalized = trimmed.to_ascii_uppercase();
    if !is_valid_tax_id(&normalized) {
        return Err(AppError::TaxIdInvalid);
    }
    Ok(Some(normalized))
}

fn is_valid_tax_id(value: &str) -> bool {
    if value.chars().count() > MAX_TAX_ID_LEN {
        return false;
    }
    let mut alphanumeric = 0;
    for character in value.chars() {
        if character.is_ascii_alphanumeric() {
            alphanumeric += 1;
        } else if character != '-' {
            return false;
        }
    }
    alphanumeric > 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_names_and_normalizes_tax_id() {
        let draft = validate_draft("  Taller Norte  ", "  Norte  ", "  demo-0001 ").unwrap();
        assert_eq!(draft.legal_name, "Taller Norte");
        assert_eq!(draft.trade_name.as_deref(), Some("Norte"));
        assert_eq!(draft.tax_id.as_deref(), Some("DEMO-0001"));
    }

    #[test]
    fn blank_optional_fields_become_absent() {
        let draft = validate_draft("Taller Norte", "   ", "").unwrap();
        assert_eq!(draft.trade_name, None);
        assert_eq!(draft.tax_id, None);
    }

    #[test]
    fn rejects_empty_legal_name() {
        let error = validate_draft("   ", "", "").unwrap_err();
        assert_eq!(error, AppError::LegalNameRequired);
    }

    #[test]
    fn rejects_oversized_legal_name() {
        let name = "A".repeat(161);
        let error = validate_draft(&name, "", "").unwrap_err();
        assert_eq!(error, AppError::LegalNameTooLong);
    }

    #[test]
    fn rejects_invalid_tax_id() {
        let error = validate_draft("Taller Norte", "", "RFC 123").unwrap_err();
        assert_eq!(error, AppError::TaxIdInvalid);
    }

    #[test]
    fn display_name_prefers_trade_name() {
        let company = Company {
            id: "1".to_string(),
            legal_name: "Taller Norte S.A.".to_string(),
            trade_name: Some("Norte".to_string()),
            tax_id: None,
            created_at: "2026-11-14T00:00:00Z".to_string(),
            updated_at: "2026-11-14T00:00:00Z".to_string(),
        };
        assert_eq!(display_name(&company), "Norte");
    }
}
