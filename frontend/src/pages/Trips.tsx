import { useEffect, useState } from "react";
import { api, Trip, Vehicle, Driver } from "../lib/api";
import { Card, ErrorBanner, Spinner, Button, EmptyState } from "../components/ui";

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    trip_code: "",
    source: "",
    destination: "",
    cargo_weight: "",
    planned_distance: "",
    vehicle_id: "",
    driver_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [resTrips, resVehicles, resDrivers] = await Promise.all([
        api.get<Trip[]>("/trips"),
        api.get<Vehicle[]>("/vehicles/available"),
        api.get<Driver[]>("/drivers/available"),
      ]);
      setTrips(resTrips.data);
      setVehicles(resVehicles.data);
      setDrivers(resDrivers.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError(null);
    try {
      await api.post("/trips", {
        trip_code: addForm.trip_code,
        source: addForm.source,
        destination: addForm.destination,
        cargo_weight: Number(addForm.cargo_weight),
        planned_distance: Number(addForm.planned_distance),
        vehicle_id: addForm.vehicle_id || undefined,
        driver_id: addForm.driver_id || undefined,
      });
      setShowAddForm(false);
      setAddForm({
        trip_code: "",
        source: "",
        destination: "",
        cargo_weight: "",
        planned_distance: "",
        vehicle_id: "",
        driver_id: "",
      });
      load();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      await api.post(`/trips/${id}/dispatch`);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleComplete = async (id: string) => {
    const actual_distance = prompt("Enter actual distance (km):");
    if (!actual_distance) return;
    const fuel_consumed = prompt("Enter fuel consumed (liters):");
    if (!fuel_consumed) return;

    try {
      await api.post(`/trips/${id}/complete`, {
        actual_distance: Number(actual_distance),
        fuel_consumed: Number(fuel_consumed),
      });
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await api.post(`/trips/${id}/cancel`);
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredTrips = trips.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.trip_code.toLowerCase().includes(s) && 
          !t.source.toLowerCase().includes(s) && 
          !t.destination.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Live Board (Trips)</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Trip"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Trip Code</label>
                <input
                  required
                  placeholder="e.g. TR-010"
                  value={addForm.trip_code}
                  onChange={(e) => setAddForm({ ...addForm, trip_code: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source</label>
                <input
                  required
                  value={addForm.source}
                  onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input
                  required
                  value={addForm.destination}
                  onChange={(e) => setAddForm({ ...addForm, destination: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo Weight (kg)</label>
                <input
                  required
                  type="number"
                  value={addForm.cargo_weight}
                  onChange={(e) => setAddForm({ ...addForm, cargo_weight: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Planned Dist (km)</label>
                <input
                  required
                  type="number"
                  value={addForm.planned_distance}
                  onChange={(e) => setAddForm({ ...addForm, planned_distance: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Vehicle</label>
                <select
                  value={addForm.vehicle_id}
                  onChange={(e) => setAddForm({ ...addForm, vehicle_id: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm bg-surface"
                >
                  <option value="">-- None (Draft) --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registration_number} - {v.name} ({v.max_load_capacity}kg)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign Driver</label>
                <select
                  value={addForm.driver_id}
                  onChange={(e) => setAddForm({ ...addForm, driver_id: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm bg-surface"
                >
                  <option value="">-- None (Draft) --</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.license_category})</option>
                  ))}
                </select>
              </div>
            </div>
            {addError && <ErrorBanner message={addError} />}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Trip"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            placeholder="Search Trip Code or Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-surface"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBanner message={error} onRetry={load} />
        ) : filteredTrips.length === 0 ? (
          <EmptyState title="No trips found matching filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-ink/70">
                  <th className="py-2 px-3 font-medium">Trip Code</th>
                  <th className="py-2 px-3 font-medium">Route</th>
                  <th className="py-2 px-3 font-medium">Vehicle & Driver</th>
                  <th className="py-2 px-3 font-medium">Cargo (kg)</th>
                  <th className="py-2 px-3 font-medium">Dist (km)</th>
                  <th className="py-2 px-3 font-medium text-right">Status</th>
                  <th className="py-2 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTrips.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-canvas">
                    <td className="py-3 px-3 font-medium">{t.trip_code}</td>
                    <td className="py-3 px-3">{t.source} &rarr; {t.destination}</td>
                    <td className="py-3 px-3 text-ink/80">
                      {t.vehicle_name || "Unassigned"}<br/>
                      <span className="text-xs">{t.driver_name || "Unassigned"}</span>
                    </td>
                    <td className="py-3 px-3">{t.cargo_weight}</td>
                    <td className="py-3 px-3">
                      {t.actual_distance ? `${t.actual_distance} (act)` : `${t.planned_distance} (est)`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                          t.status === "completed"
                            ? "bg-success/10 text-success"
                            : t.status === "dispatched"
                            ? "bg-brand/10 text-brand"
                            : t.status === "draft"
                            ? "bg-accent/20 text-accent-dark"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === "draft" && (
                          <>
                            <button onClick={() => handleDispatch(t.id)} className="text-brand hover:underline">Dispatch</button>
                            <button onClick={() => handleCancel(t.id)} className="text-danger hover:underline">Cancel</button>
                          </>
                        )}
                        {t.status === "dispatched" && (
                          <>
                            <button onClick={() => handleComplete(t.id)} className="text-success hover:underline">Complete</button>
                            <button onClick={() => handleCancel(t.id)} className="text-danger hover:underline">Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
