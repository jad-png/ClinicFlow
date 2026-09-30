BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff',
    CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff'))
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    cin VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason TEXT NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL,
    CONSTRAINT appointments_status_check
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    CONSTRAINT appointments_patient_fk
        FOREIGN KEY (patient_id) REFERENCES patients (id),
    CONSTRAINT appointments_created_by_fk
        FOREIGN KEY (created_by) REFERENCES users (id)
);

CREATE INDEX appointments_patient_id_idx ON appointments (patient_id);
CREATE INDEX appointments_created_by_idx ON appointments (created_by);
CREATE INDEX appointments_appointment_date_idx ON appointments (appointment_date);
CREATE INDEX appointments_status_idx ON appointments (status);

COMMIT;
