import { Router } from "express";
import { pool, query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const tripsRouter = Router();
tripsRouter.use(requireAuth);

// GET /api/trips — the "Live Board"
tripsRouter.get(
  "/",
  requirePermission("trips", "view"),
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT trips.*, vehicles.name AS vehicle_name, drivers.name AS driver_name
       FROM trips
       LEFT JOIN vehicles ON vehicles.id = trips.vehicle_id
       LEFT JOIN drivers ON drivers.id = trips.driver_id
       ORDER BY trips.created_at DESC`
    );
    res.json(result.rows);
  })
);

// POST /api/trips — create a Draft trip (no vehicle/driver assigned yet is allowed)
tripsRouter.post(
  "/",
  requirePermission("trips", "full"),
  validate({
    trip_code: "string",
    source: "string",
    destination: "string",
    cargo_weight: "number",
    planned_distance: "number",
    vehicle_id: "string?",
    driver_id: "string?",
  }),
  asyncHandler(async (req, res) => {
    const { trip_code, source, destination, cargo_weight, planned_distance, vehicle_id, driver_id } = req.body;
    const result = await query(
      `INSERT INTO trips (trip_code, source, destination, cargo_weight, planned_distance, vehicle_id, driver_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [trip_code, source, destination, cargo_weight, planned_distance, vehicle_id ?? null, driver_id ?? null]
    );
    res.status(201).json(result.rows[0]);
  })
);

/**
 * POST /api/trips/:id/dispatch
 *
 * This is the core validation logic from the Trip Dispatcher mockup:
 *   - Vehicle must be Available (and not Retired/In Shop)
 *   - Driver must be Available (not Suspended / On Trip / Off Duty)
 *   - Driver's license must not be expired
 *   - Cargo weight must not exceed the vehicle's max_load_capacity
 *   - All four checks + both status flips happen in a single DB transaction:
 *     if any check fails, nothing is written — you never end up with a
 *     vehicle marked "on_trip" while the trip itself failed to dispatch.
 */
tripsRouter.post(
  "/:id/dispatch",
  requirePermission("trips", "full"),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const tripResult = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [req.params.id]);
      const trip = tripResult.rows[0];
      if (!trip) throw new AppError("Trip not found", 404);
      if (trip.status !== "draft") throw new AppError(`Trip is already ${trip.status}`, 409);
      if (!trip.vehicle_id || !trip.driver_id) {
        throw new AppError("Trip needs both a vehicle and a driver assigned before dispatch.", 422);
      }

      const vehicleResult = await client.query("SELECT * FROM vehicles WHERE id = $1 FOR UPDATE", [trip.vehicle_id]);
      const vehicle = vehicleResult.rows[0];
      if (!vehicle) throw new AppError("Vehicle not found", 404);
      if (vehicle.status !== "available") {
        throw new AppError(`Vehicle ${vehicle.name} is not available (status: ${vehicle.status})`, 409);
      }

      const driverResult = await client.query("SELECT * FROM drivers WHERE id = $1 FOR UPDATE", [trip.driver_id]);
      const driver = driverResult.rows[0];
      if (!driver) throw new AppError("Driver not found", 404);
      if (driver.status !== "available") {
        throw new AppError(`Driver ${driver.name} is not available (status: ${driver.status})`, 409);
      }
      if (new Date(driver.license_expiry) < new Date()) {
        throw new AppError(`Driver ${driver.name}'s license expired on ${driver.license_expiry}`, 409);
      }

      if (Number(trip.cargo_weight) > Number(vehicle.max_load_capacity)) {
        throw new AppError(
          `Capacity exceeded by ${trip.cargo_weight - vehicle.max_load_capacity} kg — dispatch blocked`,
          422
        );
      }

      await client.query("UPDATE vehicles SET status = 'on_trip' WHERE id = $1", [vehicle.id]);
      await client.query("UPDATE drivers SET status = 'on_trip' WHERE id = $1", [driver.id]);
      const updatedTrip = await client.query(
        `UPDATE trips SET status = 'dispatched', dispatched_at = now() WHERE id = $1 RETURNING *`,
        [trip.id]
      );

      await client.query("COMMIT");
      res.json(updatedTrip.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  })
);

// POST /api/trips/:id/complete — restores vehicle + driver to Available
tripsRouter.post(
  "/:id/complete",
  requirePermission("trips", "full"),
  validate({ actual_distance: "number?", fuel_consumed: "number?" }),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const tripResult = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [req.params.id]);
      const trip = tripResult.rows[0];
      if (!trip) throw new AppError("Trip not found", 404);
      if (trip.status !== "dispatched") throw new AppError(`Trip is not dispatched (status: ${trip.status})`, 409);

      const { actual_distance, fuel_consumed } = req.body;
      const updated = await client.query(
        `UPDATE trips SET status = 'completed', completed_at = now(),
           actual_distance = COALESCE($1, actual_distance),
           fuel_consumed = COALESCE($2, fuel_consumed)
         WHERE id = $3 RETURNING *`,
        [actual_distance ?? null, fuel_consumed ?? null, trip.id]
      );

      await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [trip.vehicle_id]);
      await client.query("UPDATE drivers SET status = 'available' WHERE id = $1", [trip.driver_id]);

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

// POST /api/trips/:id/cancel — restores vehicle + driver to Available (only if dispatched)
tripsRouter.post(
  "/:id/cancel",
  requirePermission("trips", "full"),
  asyncHandler(async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const tripResult = await client.query("SELECT * FROM trips WHERE id = $1 FOR UPDATE", [req.params.id]);
      const trip = tripResult.rows[0];
      if (!trip) throw new AppError("Trip not found", 404);
      if (!["draft", "dispatched"].includes(trip.status)) {
        throw new AppError(`Trip cannot be cancelled from status: ${trip.status}`, 409);
      }

      const wasDispatched = trip.status === "dispatched";
      const updated = await client.query(`UPDATE trips SET status = 'cancelled' WHERE id = $1 RETURNING *`, [trip.id]);

      if (wasDispatched) {
        await client.query("UPDATE vehicles SET status = 'available' WHERE id = $1", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'available' WHERE id = $1", [trip.driver_id]);
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
