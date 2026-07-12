import { Router } from "express";
import { query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const driversRouter = Router();
driversRouter.use(requireAuth);

driversRouter.get(
  "/",
  requirePermission("drivers", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(`SELECT * FROM drivers ORDER BY created_at DESC`);
    res.json(result.rows);
  })
);

// Drivers eligible for trip assignment — excludes expired license or Suspended,
// per the mockup's inline rule: "Expired license or Suspended status -> blocked from trip assignment"
driversRouter.get(
  "/available",
  requirePermission("trips", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT * FROM drivers WHERE status = 'available' AND license_expiry >= CURRENT_DATE ORDER BY name`
    );
    res.json(result.rows);
  })
);

driversRouter.get(
  "/:id/trips",
  requirePermission("trips", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(`SELECT * FROM trips WHERE driver_id = $1 ORDER BY created_at DESC`, [req.params.id]);
    res.json(result.rows);
  })
);

driversRouter.post(
  "/",
  requirePermission("drivers", "full"),
  validate({
    name: "string",
    license_number: "string",
    license_category: "string",
    license_expiry: "string",
    contact_number: "string",
  }),
  asyncHandler(async (req, res) => {
    const { name, license_number, license_category, license_expiry, contact_number } = req.body;
    if (!["LMV", "HMV"].includes(license_category)) {
      throw new AppError("license_category must be LMV or HMV", 422);
    }
    const result = await query(
      `INSERT INTO drivers (name, license_number, license_category, license_expiry, contact_number)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, license_number, license_category, license_expiry, contact_number]
    );
    res.status(201).json(result.rows[0]);
  })
);

// Toggle status — matches the mockup's "TOGGLE STATUS" buttons (Available / On Trip / Off Duty / Suspended)
driversRouter.patch(
  "/:id/status",
  requirePermission("drivers", "full"),
  validate({ status: "string" }),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["available", "on_trip", "off_duty", "suspended"].includes(status)) {
      throw new AppError("Invalid status", 422);
    }
    const result = await query(`UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *`, [status, req.params.id]);
    if (!result.rows.length) throw new AppError("Driver not found", 404);
    res.json(result.rows[0]);
  })
);
