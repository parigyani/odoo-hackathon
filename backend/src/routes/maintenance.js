import { Router } from "express";
import { pool, query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const maintenanceRouter = Router();
maintenanceRouter.use(requireAuth);

maintenanceRouter.get(
  "/",
  requirePermission("maintenance", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT maintenance_logs.*, vehicles.name AS vehicle_name
       FROM maintenance_logs
       JOIN vehicles ON vehicles.id = maintenance_logs.vehicle_id
       ORDER BY maintenance_logs.created_at DESC`
    );
    res.json(result.rows);
  })
);

/**
 * POST /api/maintenance — "Log Service Record" from the mockup.
 * Creating an active record automatically flips the vehicle to In Shop
 * and removes it from the dispatch pool (enforced by the vehicles.status
 * check already used in the trip dispatch/availability queries).
 */
maintenanceRouter.post(
  "/",
  requirePermission("maintenance", "full"),
  validate({ vehicle_id: "string", service_type: "string", cost: "number", service_date: "string" }),
  asyncHandler(async (req, res) => {
    const { vehicle_id, service_type, cost, service_date } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // FOR UPDATE — prevents two concurrent POST /maintenance calls for the
      // same vehicle from both reading status != 'on_trip' and inserting
      // duplicate active maintenance records, which would leave the vehicle
      // double-locked in 'in_shop' with two open logs to close.
      const vehicle = await client.query("SELECT * FROM vehicles WHERE id = $1 FOR UPDATE", [vehicle_id]);
      if (!vehicle.rows.length) throw new AppError("Vehicle not found", 404);
      if (vehicle.rows[0].status === "on_trip") {
        throw new AppError("Cannot log maintenance for a vehicle currently on a trip.", 409);
      }

      const log = await client.query(
        `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status)
         VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
        [vehicle_id, service_type, cost, service_date]
      );
      await client.query(`UPDATE vehicles SET status = 'in_shop' WHERE id = $1`, [vehicle_id]);

      await client.query("COMMIT");
      res.status(201).json(log.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// POST /api/maintenance/:id/close — restores vehicle to Available (unless retired)
maintenanceRouter.post(
  "/:id/close",
  requirePermission("maintenance", "full"),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // FOR UPDATE — prevents two concurrent POST /maintenance/:id/close calls
      // from both passing the `status !== 'completed'` check and writing
      // 'completed' twice. Without it both would also fire the vehicle status
      // flip, causing a harmless but confusing double-update and making audit
      // logs misleading.
      const log = await client.query("SELECT * FROM maintenance_logs WHERE id = $1 FOR UPDATE", [req.params.id]);
      if (!log.rows.length) throw new AppError("Maintenance log not found", 404);
      if (log.rows[0].status === "completed") throw new AppError("Already closed", 409);

      const updated = await client.query(
        `UPDATE maintenance_logs SET status = 'completed' WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      const vehicle = await client.query("SELECT status FROM vehicles WHERE id = $1", [log.rows[0].vehicle_id]);
      if (vehicle.rows[0]?.status !== "retired") {
        await client.query(`UPDATE vehicles SET status = 'available' WHERE id = $1`, [log.rows[0].vehicle_id]);
      }

      await client.query("COMMIT");
      res.json(updated.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);
