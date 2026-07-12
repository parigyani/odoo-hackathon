-- =====================================================================
-- 002_seed_extra.sql
-- Sample operational data for Analytics and Fuel & Expenses screens.
-- All rows are tied to the vehicles seeded in 001_init.sql.
-- Uses ON CONFLICT DO NOTHING throughout — safe to re-run.
-- =====================================================================

-- ===================== MAINTENANCE LOGS =====================
-- MINI-03 (GJ01AB1120) is already In Shop; give it an active service record.
-- VAN-05 and TRUCK-11 each have one historical (completed) record.

INSERT INTO maintenance_logs (id, vehicle_id, service_type, cost, service_date, status) VALUES

-- Active record for MINI-03 (explains why it is In Shop today)
(
    'b1000000-0000-0000-0000-000000000001',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB1120'),
    'Engine Repair',
    18500.00,
    current_date - interval '2 days',
    'active'
),

-- Completed oil-change for VAN-05 last month
(
    'b1000000-0000-0000-0000-000000000002',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB452'),
    'Oil Change',
    2200.00,
    current_date - interval '30 days',
    'completed'
),

-- Completed tyre replacement for TRUCK-11 last quarter
(
    'b1000000-0000-0000-0000-000000000003',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB998'),
    'Tyre Replacement',
    14000.00,
    current_date - interval '90 days',
    'completed'
),

-- Completed brake inspection for VAN-09 (retired, historical record still valid)
(
    'b1000000-0000-0000-0000-000000000004',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB008'),
    'Brake Inspection',
    3500.00,
    current_date - interval '180 days',
    'completed'
)

ON CONFLICT (id) DO NOTHING;


-- ===================== FUEL LOGS =====================
-- Several fill-ups across the active vehicles; gives Analytics a
-- meaningful fuel-cost trend and fleet-level consumption figures.

INSERT INTO fuel_logs (id, vehicle_id, liters, cost, logged_at) VALUES

-- VAN-05 fill-ups (₹96/litre approx, local pump rate)
(
    'c1000000-0000-0000-0000-000000000001',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB452'),
    45.0, 4320.00,
    current_date - interval '35 days'
),
(
    'c1000000-0000-0000-0000-000000000002',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB452'),
    38.5, 3696.00,
    current_date - interval '7 days'
),

-- TRUCK-11 fill-ups (diesel, higher volume)
(
    'c1000000-0000-0000-0000-000000000003',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB998'),
    120.0, 10440.00,
    current_date - interval '10 days'
),
(
    'c1000000-0000-0000-0000-000000000004',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB998'),
    98.0,  8526.00,
    current_date - interval '3 days'
),

-- MINI-03 last fill-up before going In Shop
(
    'c1000000-0000-0000-0000-000000000005',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB1120'),
    30.0, 2880.00,
    current_date - interval '5 days'
)

ON CONFLICT (id) DO NOTHING;


-- ===================== EXPENSES (toll + misc, per trip) =====================
-- Tied to the completed trip TR-003 and the dispatched trip TR-002 so the
-- Fuel & Expenses screen can show a full cost breakdown.

INSERT INTO expenses (id, trip_id, vehicle_id, toll, other) VALUES

-- TR-003 (completed, VAN-05, Mumbai→Pune expressway toll)
(
    'd1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB452'),
    380.00,  -- Expressway toll both ways
    150.00   -- Driver allowance
),

-- TR-002 (dispatched, TRUCK-11, Surat→Mumbai; toll logged at origin gate)
(
    'd1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB998'),
    920.00,  -- NH-48 heavy vehicle toll
    500.00   -- Loading/unloading labour + driver allowance
),

-- Vehicle-level misc expense for MINI-03 (parking + cleaning before In Shop)
(
    'd1000000-0000-0000-0000-000000000003',
    NULL,    -- not tied to a specific trip
    (SELECT id FROM vehicles WHERE registration_number = 'GJ01AB1120'),
    0.00,
    800.00
)

ON CONFLICT (id) DO NOTHING;
