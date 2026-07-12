CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================== USERS / AUTH / RBAC =====================
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst')),
    failed_attempts INT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== VEHICLES =====================
CREATE TABLE IF NOT EXISTS vehicles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,               -- e.g. "VAN-05"
    type                TEXT NOT NULL,                -- Van / Truck / Mini
    max_load_capacity   NUMERIC NOT NULL CHECK (max_load_capacity > 0),
    odometer            NUMERIC NOT NULL DEFAULT 0,
    acquisition_cost    NUMERIC NOT NULL,
    status              TEXT NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available', 'on_trip', 'in_shop', 'retired')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);

-- ===================== DRIVERS =====================
CREATE TABLE IF NOT EXISTS drivers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    license_number    TEXT NOT NULL UNIQUE,
    license_category  TEXT NOT NULL CHECK (license_category IN ('LMV', 'HMV')),
    license_expiry    DATE NOT NULL,
    contact_number    TEXT NOT NULL,
    safety_score      INT NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status            TEXT NOT NULL DEFAULT 'available'
                       CHECK (status IN ('available', 'on_trip', 'off_duty', 'suspended')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- ===================== TRIPS =====================
CREATE TABLE IF NOT EXISTS trips (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_code         TEXT NOT NULL UNIQUE,           -- e.g. "TR001"
    source             TEXT NOT NULL,
    destination         TEXT NOT NULL,
    vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id         UUID REFERENCES drivers(id) ON DELETE SET NULL,
    cargo_weight      NUMERIC NOT NULL CHECK (cargo_weight > 0),
    planned_distance  NUMERIC NOT NULL,
    actual_distance   NUMERIC,
    fuel_consumed     NUMERIC,
    status            TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'dispatched', 'completed', 'cancelled')),
    dispatched_at     TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);

-- ===================== MAINTENANCE =====================
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id    UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type  TEXT NOT NULL,                       -- Oil Change / Engine Repair / Tyre Replace...
    cost          NUMERIC NOT NULL DEFAULT 0,
    service_date  DATE NOT NULL,
    status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_logs(vehicle_id);

-- ===================== FUEL LOGS =====================
CREATE TABLE IF NOT EXISTS fuel_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    liters      NUMERIC NOT NULL CHECK (liters > 0),
    cost        NUMERIC NOT NULL CHECK (cost >= 0),
    logged_at   DATE NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_logs(vehicle_id);

-- ===================== EXPENSES (toll / misc, per trip) =====================
CREATE TABLE IF NOT EXISTS expenses (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id      UUID REFERENCES trips(id) ON DELETE SET NULL,
    vehicle_id   UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    toll         NUMERIC NOT NULL DEFAULT 0,
    other        NUMERIC NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);

-- ===================== updated_at triggers =====================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON vehicles;
CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_drivers_updated_at ON drivers;
CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===================== SEED DATA (matches the mockups) =====================
INSERT INTO vehicles (registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status) VALUES
    ('GJ01AB452',  'VAN-05',   'Van',   500,  74000,  620000, 'available'),
    ('GJ01AB998',  'TRUCK-11', 'Truck', 5000, 182000, 2450000, 'on_trip'),
    ('GJ01AB1120', 'MINI-03',  'Mini',  1000, 66000,  410000, 'in_shop'),
    ('GJ01AB008',  'VAN-09',   'Van',   750,  241900, 590000, 'retired')
ON CONFLICT (registration_number) DO NOTHING;

INSERT INTO drivers (name, license_number, license_category, license_expiry, contact_number, safety_score, status) VALUES
    ('Alex',   'DL-88213', 'LMV', '2028-12-01', '98765xxxxx', 96, 'available'),
    ('John',   'DL-44120', 'HMV', '2025-03-01', '98220xxxxx', 81, 'suspended'),
    ('Priya',  'DL-77031', 'LMV', '2028-08-01', '99110xxxxx', 99, 'on_trip'),
    ('Suresh', 'DL-90045', 'HMV', '2027-01-01', '97440xxxxx', 88, 'off_duty')
ON CONFLICT (license_number) DO NOTHING;
