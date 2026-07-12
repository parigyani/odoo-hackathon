import { Router } from "express";
import { query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const fuelExpensesRouter = Router();
fuelExpensesRouter.use(requireAuth);

fuelExpensesRouter.get(
  "/fuel-logs",
  requirePermission("fuel_expenses", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT fuel_logs.*, vehicles.name AS vehicle_name
       FROM fuel_logs JOIN vehicles ON vehicles.id = fuel_logs.vehicle_id
       ORDER BY logged_at DESC`
    );
    res.json(result.rows);
  })
);

fuelExpensesRouter.post(
  "/fuel-logs",
  requirePermission("fuel_expenses", "full"),
  validate({ vehicle_id: "string", liters: "number", cost: "number", logged_at: "string" }),
  asyncHandler(async (req, res) => {
    const { vehicle_id, liters, cost, logged_at } = req.body;
    const result = await query(
      `INSERT INTO fuel_logs (vehicle_id, liters, cost, logged_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicle_id, liters, cost, logged_at]
    );
    res.status(201).json(result.rows[0]);
  })
);

fuelExpensesRouter.get(
  "/expenses",
  requirePermission("fuel_expenses", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT expenses.*, vehicles.name AS vehicle_name, trips.trip_code
       FROM expenses
       JOIN vehicles ON vehicles.id = expenses.vehicle_id
       LEFT JOIN trips ON trips.id = expenses.trip_id
       ORDER BY expenses.created_at DESC`
    );
    res.json(result.rows);
  })
);

fuelExpensesRouter.post(
  "/expenses",
  requirePermission("fuel_expenses", "full"),
  validate({ vehicle_id: "string", toll: "number?", other: "number?", trip_id: "string?" }),
  asyncHandler(async (req, res) => {
    const { vehicle_id, toll, other, trip_id } = req.body;
    const result = await query(
      `INSERT INTO expenses (vehicle_id, toll, other, trip_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [vehicle_id, toll ?? 0, other ?? 0, trip_id ?? null]
    );
    res.status(201).json(result.rows[0]);
  })
);

/**
 * GET /api/fuel-expenses/operational-cost
 * Matches the mockup: "TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT"
 * Computed on read, never stored — avoids the classic bug of a cached
 * total drifting out of sync with the underlying logs.
 */
fuelExpensesRouter.get(
  "/operational-cost",
  requirePermission("fuel_expenses", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(`
      SELECT
        vehicles.id, vehicles.name,
        COALESCE(fuel.total, 0) AS fuel_cost,
        COALESCE(maint.total, 0) AS maintenance_cost,
        COALESCE(exp.total, 0) AS expense_total,
        COALESCE(fuel.total, 0) + COALESCE(maint.total, 0) + COALESCE(exp.total, 0) AS total_operational_cost
      FROM vehicles
      LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total FROM fuel_logs GROUP BY vehicle_id) fuel
        ON fuel.vehicle_id = vehicles.id
      LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total FROM maintenance_logs GROUP BY vehicle_id) maint
        ON maint.vehicle_id = vehicles.id
      LEFT JOIN (SELECT vehicle_id, SUM(toll + other) AS total FROM expenses GROUP BY vehicle_id) exp
        ON exp.vehicle_id = vehicles.id
      ORDER BY total_operational_cost DESC
    `);
    res.json(result.rows);
  })
);
