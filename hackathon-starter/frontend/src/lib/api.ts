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
