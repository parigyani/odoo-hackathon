import { Router } from "express";
import { query } from "../db/pool.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

// GET /api/analytics/dashboard — the 7 KPI cards from the Dashboard mockup
analyticsRouter.get(
  "/dashboard",
  requirePermission("analytics", "view"),
  asyncHandler(async (req, res) => {
    const vehicleCounts = await query(`
      SELECT status, COUNT(*)::int AS count FROM vehicles GROUP BY status
    `);
    const counts = Object.fromEntries(vehicleCounts.rows.map((r) => [r.status, r.count]));

    const tripCounts = await query(`
      SELECT status, COUNT(*)::int AS count FROM trips GROUP BY status
    `);
    const trips = Object.fromEntries(tripCounts.rows.map((r) => [r.status, r.count]));

    const driversOnDuty = await query(`
      SELECT COUNT(*)::int AS count FROM drivers WHERE status IN ('available', 'on_trip')
    `);

    const totalNonRetired = Object.entries(counts)
      .filter(([status]) => status !== "retired")
      .reduce((sum, [, c]) => sum + c, 0);
    const onTrip = counts.on_trip ?? 0;
    // Fleet Utilization % = vehicles currently on_trip / all non-retired vehicles
    const fleetUtilization = totalNonRetired ? Math.round((onTrip / totalNonRetired) * 100) : 0;

    res.json({
      active_vehicles: totalNonRetired,
      available_vehicles: counts.available ?? 0,
      vehicles_in_maintenance: counts.in_shop ?? 0,
      active_trips: trips.dispatched ?? 0,
      pending_trips: trips.draft ?? 0,
      drivers_on_duty: driversOnDuty.rows[0].count,
      fleet_utilization_pct: fleetUtilization,
      vehicle_status_breakdown: counts,
    });
  })
);

// GET /api/analytics/reports — Fuel Efficiency, Utilization, Operational Cost, ROI, Top Costliest
analyticsRouter.get(
  "/reports",
  requirePermission("analytics", "view"),
  asyncHandler(async (req, res) => {
    // Fuel Efficiency (km/l) = total actual_distance across completed trips / total liters logged
    const efficiency = await query(`
      SELECT
        COALESCE(SUM(t.actual_distance), 0) AS total_distance,
        COALESCE((SELECT SUM(liters) FROM fuel_logs), 0) AS total_liters
      FROM trips t WHERE t.status = 'completed'
    `);
    const { total_distance, total_liters } = efficiency.rows[0];
    const fuelEfficiency = total_liters > 0 ? Number(total_distance) / Number(total_liters) : 0;

    // Top costliest vehicles — reuses the same fuel+maintenance+expense aggregation as operational-cost
    const topCostliest = await query(`
      SELECT vehicles.name,
        COALESCE(fuel.total, 0) + COALESCE(maint.total, 0) + COALESCE(exp.total, 0) AS total_cost
      FROM vehicles
      LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total FROM fuel_logs GROUP BY vehicle_id) fuel
        ON fuel.vehicle_id = vehicles.id
      LEFT JOIN (SELECT vehicle_id, SUM(cost) AS total FROM maintenance_logs GROUP BY vehicle_id) maint
        ON maint.vehicle_id = vehicles.id
      LEFT JOIN (SELECT vehicle_id, SUM(toll + other) AS total FROM expenses GROUP BY vehicle_id) exp
        ON exp.vehicle_id = vehicles.id
      ORDER BY total_cost DESC
      LIMIT 5
    `);

    res.json({
      fuel_efficiency_km_per_l: Number(fuelEfficiency.toFixed(1)),
      top_costliest_vehicles: topCostliest.rows,
      // ROI formula per the mockup: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      // Revenue isn't in the mandatory scope's data model (no invoicing), so this
      // is left as a documented formula for the report screen rather than faked with
      // placeholder numbers — flag this as an assumption in the idea document.
      roi_formula: "(Revenue - (Maintenance + Fuel)) / Acquisition Cost",
    });
  })
);
