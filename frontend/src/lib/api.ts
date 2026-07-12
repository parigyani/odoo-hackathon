import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request once logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.message || "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export type Role = "fleet_manager" | "dispatcher" | "safety_officer" | "financial_analyst";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface DashboardStats {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization_pct: number;
  vehicle_status_breakdown: Record<string, number>;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  name: string;
  type: string;
  max_load_capacity: number;
  acquisition_cost: number;
  odometer: number;
  status: "available" | "on_trip" | "in_shop" | "retired";
  created_at: string;
}

export interface Driver {
  id: string;
  name: string;
  license_number: string;
  license_category: "LMV" | "HMV";
  license_expiry: string;
  contact_number: string;
  status: "available" | "on_trip" | "off_duty" | "suspended";
  safety_score?: number;
  created_at: string;
}

export interface Trip {
  id: string;
  trip_code: string;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance?: number;
  fuel_consumed?: number;
  vehicle_id?: string;
  driver_id?: string;
  vehicle_name?: string;
  driver_name?: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  dispatched_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  vehicle_name?: string;
  service_type: string;
  cost: number;
  service_date: string;
  status: "active" | "completed";
  created_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  vehicle_name?: string;
  liters: number;
  cost: number;
  logged_at: string;
  created_at: string;
}

export interface Expense {
  id: string;
  trip_id?: string;
  trip_code?: string;
  vehicle_id: string;
  vehicle_name?: string;
  toll: number;
  other: number;
  created_at: string;
}

export interface OperationalCost {
  id: string;
  name: string;
  fuel_cost: number;
  maintenance_cost: number;
  expense_total: number;
  total_operational_cost: number;
}

export interface AnalyticsReports {
  fuel_efficiency_km_per_l: number;
  top_costliest_vehicles: { name: string; total_cost: number }[];
  roi_formula: string;
}
