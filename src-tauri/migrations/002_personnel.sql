-- Persona y expediente digital, aislados por empresa.
-- La relación laboral queda prevista para entregas posteriores; no se crea una tabla vacía.
-- No hay borrado físico: archived_at queda disponible para bajas futuras.
-- Sin CURP, RFC, salarios, datos bancarios ni documentos sensibles.

CREATE TABLE people (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    given_name TEXT NOT NULL,
    family_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT
);

CREATE INDEX idx_people_company ON people(company_id);
CREATE INDEX idx_people_company_name ON people (
    company_id,
    family_name COLLATE NOCASE,
    given_name COLLATE NOCASE
);

CREATE TABLE personnel_files (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    person_id TEXT NOT NULL UNIQUE REFERENCES people(id),
    employee_number TEXT NOT NULL COLLATE NOCASE,
    administrative_status TEXT NOT NULL
        CHECK (administrative_status IN ('active', 'inactive')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    archived_at TEXT,
    UNIQUE (company_id, employee_number)
);

CREATE INDEX idx_personnel_files_company ON personnel_files(company_id);
CREATE INDEX idx_personnel_files_company_number ON personnel_files (
    company_id,
    employee_number
);
CREATE INDEX idx_personnel_files_status ON personnel_files (
    company_id,
    administrative_status
);
