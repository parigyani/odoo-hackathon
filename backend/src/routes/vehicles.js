import { Router } from "express";
import { query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const vehiclesRouter = Router();
vehiclesRouter.use(requireAuth);

// GET /api/vehicles?type=&status=&search= — matches Vehicle Registry filters
vehiclesRouter.get(
  "/",
  requirePermission("fleet", "view"),
  asyncHandler(async (req, res) => {
    const { type, status, search } = req.query;
    const conditions = [];
    const params = [];

    if (type && type !== "all") {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    if (status && status !== "all") {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`registration_number ILIKE $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await query(`SELECT * FROM vehicles ${where} ORDER BY created_at DESC`, params);
    res.json(result.rows);
  })
);

// Vehicles available for dispatch — excludes Retired/In Shop, per the mockup's inline rule
vehiclesRouter.get(
  "/available",
  requirePermission("trips", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(`SELECT * FROM vehicles WHERE status = 'available' ORDER BY name`);
    res.json(result.rows);
  })
);

vehiclesRouter.post(
  "/",
  requirePermission("fleet", "full"),
  validate({
    registration_number: "string",
    name: "string",
    type: "string",
    max_load_capacity: "number",
    acquisition_cost: "number",
    odometer: "number?",
  }),
  asyncHandler(async (req, res) => {
    const { registration_number, name, type, max_load_capacity, acquisition_cost, odometer } = req.body;
    const result = await query(
      `INSERT INTO vehicles (registration_number, name, type, max_load_capacity, acquisition_cost, odometer)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [registration_number, name, type, max_load_capacity, acquisition_cost, odometer ?? 0]
    );
    res.status(201).json(result.rows[0]);
  })
);

vehiclesRouter.patch(
  "/:id",
  requirePermission("fleet", "full"),
  asyncHandler(async (req, res) => {
    const { status, odometer } = req.body;
    const result = await query(
      `UPDATE vehicles SET status = COALESCE($1, status), odometer = COALESCE($2, odometer) WHERE id = $3 RETURNING *`,
      [status ?? null, odometer ?? null, req.params.id]
    );
    if (!result.rows.length) throw new AppError("Vehicle not found", 404);
    res.json(result.rows[0]);
  })
);
