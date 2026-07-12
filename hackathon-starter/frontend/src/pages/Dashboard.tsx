import { useEffect, useState } from "react";
import { api, DashboardStats } from "../lib/api";
import { Card, ErrorBanner, Spinner } from "../components/ui";

const KPI_LABELS: { key: keyof DashboardStats; label: string }[] = [
  { key: "active_vehicles", label: "Active Vehicles" },
  { key: "available_vehicles", label: "Available Vehicles" },
  { key: "vehicles_in_maintenance", label: "Vehicles in Maintenance" },
  { key: "active_trips", label: "Active Trips" },
  { key: "pending_trips", label: "Pending Trips" },
  { key: "drivers_on_duty", label: "Drivers On Duty" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<DashboardStats>("/analytics/dashboard");
      setStats(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_LABELS.map(({ key, label }) => (
          <Card key={key}>
            <p className="text-xs text-ink/50 uppercase">{label}</p>
            <p className="font-display text-2xl font-semibold mt-1">{stats[key] as number}</p>
          </Card>
        ))}
        <Card>
          <p className="text-xs text-ink/50 uppercase">Fleet Utilization</p>
          <p className="font-display text-2xl font-semibold mt-1 text-brand">
            {stats.fleet_utilization_pct}%
          </p>
        </Card>
      </div>

      <Card>
        <p className="font-medium mb-3">Vehicle Status</p>
        <div className="space-y-2">
          {Object.entries(stats.vehicle_status_breakdown).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3 text-sm">
              <span className="w-24 capitalize text-ink/60">{status.replace("_", " ")}</span>
              <div className="flex-1 h-2 bg-border rounded overflow-hidden">
                <div
                  className="h-full bg-brand"
                  style={{ width: `${Math.min(100, (count / (stats.active_vehicles || 1)) * 100)}%` }}
                />
              </div>
              <span className="w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
