import { useEffect, useState } from "react";
import { api, DashboardStats, AnalyticsReports } from "../lib/api";
import { PageHeader, Card, LoadingSpinner, ErrorBanner } from "../components/ui";

export default function Analytics() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<AnalyticsReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, repRes] = await Promise.all([
        api.get("/analytics/dashboard"),
        api.get("/analytics/reports")
      ]);
      setDashboardStats(dashRes.data);
      setReports(repRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;
  if (!dashboardStats || !reports) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Performance metrics and cost analysis" />

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-brand">
          <h4 className="text-xs font-medium text-ink/60 uppercase tracking-wide">Fleet Utilization</h4>
          <p className="text-3xl font-display font-semibold mt-2">{dashboardStats.fleet_utilization_pct}%</p>
          <p className="text-xs text-ink/50 mt-1">Active vehicles currently on trips</p>
        </Card>
        
        <Card className="p-5 border-l-4 border-l-accent">
          <h4 className="text-xs font-medium text-ink/60 uppercase tracking-wide">Fuel Efficiency</h4>
          <p className="text-3xl font-display font-semibold mt-2">{reports.fuel_efficiency_km_per_l} <span className="text-lg">km/l</span></p>
          <p className="text-xs text-ink/50 mt-1">Average across all completed trips</p>
        </Card>
        
        <Card className="p-5 border-l-4 border-l-warning">
          <h4 className="text-xs font-medium text-ink/60 uppercase tracking-wide">In Maintenance</h4>
          <p className="text-3xl font-display font-semibold mt-2">{dashboardStats.vehicles_in_maintenance}</p>
          <p className="text-xs text-ink/50 mt-1">Vehicles currently in shop</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-success">
          <h4 className="text-xs font-medium text-ink/60 uppercase tracking-wide">Active Trips</h4>
          <p className="text-3xl font-display font-semibold mt-2">{dashboardStats.active_trips}</p>
          <p className="text-xs text-ink/50 mt-1">Dispatched and en route</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP COSTLIEST VEHICLES */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-border bg-canvas/30">
            <h3 className="text-lg font-semibold text-ink">Top Costliest Vehicles</h3>
            <p className="text-xs text-ink/60 mt-1">Vehicles with highest total operational cost (Fuel + Maint + Tolls)</p>
          </div>
          <div className="p-5 space-y-4">
            {reports.top_costliest_vehicles.length === 0 ? (
              <p className="text-sm text-ink/50 text-center py-4">No cost data available.</p>
            ) : (
              reports.top_costliest_vehicles.map((v, i) => {
                // Find the max cost to scale the bars
                const maxCost = Math.max(...reports.top_costliest_vehicles.map(x => Number(x.total_cost)));
                const widthPct = maxCost > 0 ? (Number(v.total_cost) / maxCost) * 100 : 0;
                
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{v.name}</span>
                      <span className="font-mono">₹{Number(v.total_cost).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-canvas rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-brand h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* ROI EXPLANATION */}
        <Card className="p-6 bg-surface border-border flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-ink mb-2">ROI Calculation</h3>
          <p className="text-sm text-ink/70 mb-4">
            Fleet Return on Investment (ROI) is a critical metric for financial analysts to determine the profitability of individual assets.
          </p>
          <div className="p-4 bg-canvas rounded border border-border/50 text-center">
            <code className="text-sm font-mono text-brand font-semibold">{reports.roi_formula}</code>
          </div>
          <p className="text-xs text-ink/50 mt-4 text-center">
            * Note: Revenue tracking via invoicing is part of the future enterprise scope and is not currently tracked in this module.
          </p>
        </Card>
      </div>
    </div>
  );
}
