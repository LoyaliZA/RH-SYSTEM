-- Catálogo de puestos y relación laboral inicial, aislados por empresa.
-- No inserta filas de ejemplo. No altera 001 ni 002.
-- No hay departamentos ni sucursales: F1 no tiene esos catálogos.
-- F2.3 puede cerrar la asignación abierta (ended_on) e insertar otra sin migración destructiva.
-- F3 puede cerrar la relación (ended_on) y abrir otra para un reingreso.
-- No hay ON DELETE CASCADE: borrar un padre referenciado queda bloqueado por la clave foránea.
-- Sin salarios, CURP, RFC, bancos ni documentos.

CREATE UNIQUE INDEX idx_personnel_files_company_id
    ON personnel_files (company_id, id);

CREATE TABLE jobs (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    code TEXT NOT NULL COLLATE NOCASE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (company_id, id),
    UNIQUE (company_id, code)
);

CREATE INDEX idx_jobs_company ON jobs (company_id);
CREATE INDEX idx_jobs_company_status ON jobs (company_id, status);

CREATE TABLE employment_relationships (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    personnel_file_id TEXT NOT NULL,
    started_on TEXT NOT NULL,
    ended_on TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (company_id, id),
    FOREIGN KEY (company_id, personnel_file_id)
        REFERENCES personnel_files (company_id, id),
    CHECK (started_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    CHECK (
        ended_on IS NULL
        OR ended_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'
    ),
    CHECK (ended_on IS NULL OR ended_on >= started_on)
);

CREATE INDEX idx_employment_relationships_company
    ON employment_relationships (company_id);
CREATE INDEX idx_employment_relationships_file
    ON employment_relationships (company_id, personnel_file_id);

-- A lo sumo una relación abierta por expediente. Una relación concluida no ocupa el índice.
CREATE UNIQUE INDEX idx_employment_relationships_one_open
    ON employment_relationships (personnel_file_id)
    WHERE ended_on IS NULL;

CREATE TABLE job_assignments (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    employment_relationship_id TEXT NOT NULL,
    job_id TEXT NOT NULL,
    effective_on TEXT NOT NULL,
    ended_on TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (company_id, id),
    FOREIGN KEY (company_id, employment_relationship_id)
        REFERENCES employment_relationships (company_id, id),
    FOREIGN KEY (company_id, job_id)
        REFERENCES jobs (company_id, id),
    CHECK (effective_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    CHECK (
        ended_on IS NULL
        OR ended_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'
    ),
    CHECK (ended_on IS NULL OR ended_on >= effective_on)
);

CREATE INDEX idx_job_assignments_relationship
    ON job_assignments (employment_relationship_id);
CREATE INDEX idx_job_assignments_job
    ON job_assignments (company_id, job_id);

-- Una asignación vigente por relación. F2.3 cierra la anterior antes de abrir otra.
CREATE UNIQUE INDEX idx_job_assignments_one_open
    ON job_assignments (employment_relationship_id)
    WHERE ended_on IS NULL;
