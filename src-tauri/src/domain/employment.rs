use chrono::{Datelike, NaiveDate};

use crate::error::AppError;

const MIN_YEAR: i32 = 1900;
const MAX_YEAR: i32 = 2100;

/// Vigencia de la relación, derivada de `ended_on`.
/// No es el `administrative_status` del expediente.
/// F2.2 solo escribe relaciones abiertas (`ended_on` nulo).
/// F3 podrá concluir una relación escribiendo `ended_on` sin borrar la fila.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) enum EmploymentState {
    Open,
    Closed,
}

impl EmploymentState {
    pub(crate) fn from_ended_on(ended_on: Option<&str>) -> Self {
        if ended_on.is_none() {
            Self::Open
        } else {
            Self::Closed
        }
    }

    pub(crate) fn as_str(self) -> &'static str {
        match self {
            Self::Open => "open",
            Self::Closed => "closed",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct EmploymentRelationship {
    pub id: String,
    pub company_id: String,
    pub personnel_file_id: String,
    pub started_on: String,
    pub ended_on: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct JobAssignment {
    pub id: String,
    pub company_id: String,
    pub employment_relationship_id: String,
    pub job_id: String,
    pub effective_on: String,
    pub ended_on: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

/// Fecha de calendario `YYYY-MM-DD`, sin hora ni zona.
/// El día tiene que existir. El año queda entre 1900 y 2100.
pub(crate) fn parse_calendar_date(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.len() != 10 {
        return Err(AppError::CalendarDateInvalid);
    }
    let bytes = trimmed.as_bytes();
    let shape_ok = bytes.iter().enumerate().all(|(index, byte)| match index {
        4 | 7 => *byte == b'-',
        _ => byte.is_ascii_digit(),
    });
    if !shape_ok {
        return Err(AppError::CalendarDateInvalid);
    }
    let date = NaiveDate::parse_from_str(trimmed, "%Y-%m-%d")
        .map_err(|_| AppError::CalendarDateInvalid)?;
    if date.format("%Y-%m-%d").to_string() != trimmed {
        return Err(AppError::CalendarDateInvalid);
    }
    if date.year() < MIN_YEAR || date.year() > MAX_YEAR {
        return Err(AppError::CalendarDateOutOfRange);
    }
    Ok(trimmed.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_real_calendar_dates_inside_the_range() {
        assert_eq!(parse_calendar_date(" 2026-11-16 ").unwrap(), "2026-11-16");
        assert_eq!(parse_calendar_date("2024-02-29").unwrap(), "2024-02-29");
        assert_eq!(parse_calendar_date("1900-01-01").unwrap(), "1900-01-01");
        assert_eq!(parse_calendar_date("2100-12-31").unwrap(), "2100-12-31");
        assert_eq!(parse_calendar_date("2099-01-01").unwrap(), "2099-01-01");
    }

    #[test]
    fn rejects_impossible_or_zoned_dates() {
        for value in [
            "",
            "2026-02-31",
            "2026-02-29",
            "2026-13-01",
            "2026-2-01",
            "16/11/2026",
            "2026-11-16T00:00:00Z",
            "2026-11-16 00:00",
        ] {
            assert_eq!(
                parse_calendar_date(value).unwrap_err(),
                AppError::CalendarDateInvalid,
                "{value}"
            );
        }
        assert_eq!(
            parse_calendar_date("1899-12-31").unwrap_err(),
            AppError::CalendarDateOutOfRange
        );
        assert_eq!(
            parse_calendar_date("2101-01-01").unwrap_err(),
            AppError::CalendarDateOutOfRange
        );
    }

    #[test]
    fn derives_state_from_the_end_date_only() {
        assert_eq!(EmploymentState::from_ended_on(None), EmploymentState::Open);
        assert_eq!(
            EmploymentState::from_ended_on(Some("2026-12-01")),
            EmploymentState::Closed
        );
        assert_eq!(EmploymentState::Open.as_str(), "open");
        assert_eq!(EmploymentState::Closed.as_str(), "closed");
    }
}
