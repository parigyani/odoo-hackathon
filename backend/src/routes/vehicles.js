import { Router } from "express";
import { pool, query } from "../db/pool.js";
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

vehiclesRouter.get(
  "/:id",
  requirePermission("fleet", "view"),
  asyncHandler(async (req, res) => {
    const vehicleResult = await query(`SELECT * FROM vehicles WHERE id = $1`, [req.params.id]);
    if (!vehicleResult.rows.length) throw new AppError("Vehicle not found", 404);

    const vehicle = vehicleResult.rows[0];

    const maintenanceResult = await query(
      `SELECT * FROM maintenance_logs WHERE vehicle_id = $1 ORDER BY service_date DESC`,
      [req.params.id]
    );

    const fuelResult = await query(
      `SELECT * FROM fuel_logs WHERE vehicle_id = $1 ORDER BY logged_at DESC`,
      [req.params.id]
    );

    res.json({
      ...vehicle,
      maintenance_logs: maintenanceResult.rows,
      fuel_logs: fuelResult.rows,
    });
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
    const client = await pool.connect();
    
    try {
      await client.query("BEGIN");

      if (status === "retired") {
        // FOR UPDATE — prevents a race condition with POST /trips/:id/dispatch
        // where a vehicle is dispatched and retired at the exact same time.
        const currentVehicle = await client.query(`SELECT status FROM vehicles WHERE id = $1 FOR UPDATE`, [req.params.id]);
        if (!currentVehicle.rows.length) throw new AppError("Vehicle not found", 404);
        if (currentVehicle.rows[0].status === "on_trip") {
          throw new AppError("Cannot retire a vehicle that is currently on a trip", 409);
        }
      }

      const result = await client.query(
        `UPDATE vehicles SET status = COALESCE($1, status), odometer = COALESCE($2, odometer) WHERE id = $3 RETURNING *`,
        [status ?? null, odometer ?? null, req.params.id]
      );
      if (!result.rows.length) throw new AppError("Vehicle not found", 404);
      
      await client.query("COMMIT");
      res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);
