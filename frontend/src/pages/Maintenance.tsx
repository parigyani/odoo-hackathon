import { useEffect, useState, FormEvent } from "react";
import { api, MaintenanceLog, Vehicle } from "../lib/api";
import { PageHeader, Card, Button, Badge, LoadingSpinner, ErrorBanner } from "../components/ui";

export default function Maintenance() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formVehicle, setFormVehicle] = useState("");
  const [formServiceType, setFormServiceType] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/vehicles")
      ]);
      setLogs(logsRes.data);
      // Only show vehicles not currently on a trip in the dropdown
      setVehicles(vehiclesRes.data.filter((v: Vehicle) => v.status !== "on_trip" && v.status !== "retired"));
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogService = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);
    try {
      await api.post("/maintenance", {
        vehicle_id: formVehicle,
        service_type: formServiceType,
        cost: Number(formCost),
        service_date: formDate,
      });
      setShowForm(false);
      setFormVehicle("");
      setFormServiceType("");
      setFormCost("");
      setFormDate("");
      fetchData(); // refresh table
    } catch (err: any) {
      setFormError(err.message || "Failed to log service.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCloseRecord = async (id: string) => {
    try {
      await api.post(`/maintenance/${id}/close`);
      fetchData(); // refresh table
    } catch (err: any) {
      alert(err.message || "Failed to close record.");
    }
  };

  if (loading && logs.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <PageHeader title="Maintenance" subtitle="Manage vehicle servicing and repairs" />
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Log Service Record"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Log Service Record</h3>
          {formError && <ErrorBanner message={formError} className="mb-4" />}
          <form onSubmit={handleLogService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">VEHICLE</label>
              <select
                required
                value={formVehicle}
                onChange={(e) => setFormVehicle(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm bg-surface"
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.registration_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">SERVICE TYPE</label>
              <input
                required
                type="text"
                placeholder="e.g. Oil Change, Engine Repair"
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">COST (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">DATE</label>
              <input
                required
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-border bg-canvas/50">
                <th className="px-4 py-3 font-medium text-ink/60">DATE</th>
                <th className="px-4 py-3 font-medium text-ink/60">VEHICLE</th>
                <th className="px-4 py-3 font-medium text-ink/60">SERVICE TYPE</th>
                <th className="px-4 py-3 font-medium text-ink/60">COST</th>
                <th className="px-4 py-3 font-medium text-ink/60">STATUS</th>
                <th className="px-4 py-3 font-medium text-ink/60 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="px-4 py-3">{new Date(log.service_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium">{log.vehicle_name}</td>
                    <td className="px-4 py-3">{log.service_type}</td>
                    <td className="px-4 py-3">₹{Number(log.cost).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={log.status === "active" ? "warning" : "success"}>
                        {log.status === "active" ? "In Shop" : "Completed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.status === "active" && (
                        <button
                          onClick={() => handleCloseRecord(log.id)}
                          className="text-xs font-medium text-brand hover:text-brand/80"
                        >
                          Close Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
