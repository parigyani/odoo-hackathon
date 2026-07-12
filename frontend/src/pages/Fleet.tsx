import { useEffect, useState } from "react";
import { api, Vehicle } from "../lib/api";
import { Card, ErrorBanner, Spinner, Button, EmptyState } from "../components/ui";

export default function Fleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    registration_number: "",
    name: "",
    type: "Truck",
    max_load_capacity: "",
    acquisition_cost: "",
    odometer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Vehicle[]>("/vehicles", {
        params: {
          type: typeFilter !== "all" ? typeFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        },
      });
      setVehicles(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [typeFilter, statusFilter, search]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAddError(null);
    try {
      await api.post("/vehicles", {
        registration_number: addForm.registration_number,
        name: addForm.name,
        type: addForm.type,
        max_load_capacity: Number(addForm.max_load_capacity),
        acquisition_cost: Number(addForm.acquisition_cost),
        odometer: Number(addForm.odometer) || 0,
      });
      setShowAddForm(false);
      setAddForm({
        registration_number: "",
        name: "",
        type: "Truck",
        max_load_capacity: "",
        acquisition_cost: "",
        odometer: "",
      });
      load();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Vehicle Registry</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Vehicle"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reg No</label>
                <input
                  required
                  value={addForm.registration_number}
                  onChange={(e) => setAddForm({ ...addForm, registration_number: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name/Model</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm bg-surface"
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity (kg)</label>
                <input
                  required
                  type="number"
                  value={addForm.max_load_capacity}
                  onChange={(e) => setAddForm({ ...addForm, max_load_capacity: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Acq. Cost</label>
                <input
                  required
                  type="number"
                  value={addForm.acquisition_cost}
                  onChange={(e) => setAddForm({ ...addForm, acquisition_cost: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Odometer (km)</label>
                <input
                  type="number"
                  value={addForm.odometer}
                  onChange={(e) => setAddForm({ ...addForm, odometer: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            {addError && <ErrorBanner message={addError} />}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Vehicle"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            placeholder="Search Reg No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm w-full sm:w-64"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-surface"
          >
            <option value="all">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Car">Car</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded px-3 py-1.5 text-sm bg-surface"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBanner message={error} onRetry={load} />
        ) : vehicles.length === 0 ? (
          <EmptyState title="No vehicles found matching filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-ink/70">
                  <th className="py-2 px-3 font-medium">Reg No</th>
                  <th className="py-2 px-3 font-medium">Name/Model</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Capacity</th>
                  <th className="py-2 px-3 font-medium">Odometer</th>
                  <th className="py-2 px-3 font-medium">Acq. Cost</th>
                  <th className="py-2 px-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-canvas">
                    <td className="py-3 px-3 font-medium">{v.registration_number}</td>
                    <td className="py-3 px-3">{v.name}</td>
                    <td className="py-3 px-3">{v.type}</td>
                    <td className="py-3 px-3">{v.max_load_capacity} kg</td>
                    <td className="py-3 px-3">{v.odometer.toLocaleString()} km</td>
                    <td className="py-3 px-3">${Number(v.acquisition_cost).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                          v.status === "available"
                            ? "bg-success/10 text-success"
                            : v.status === "on_trip"
                            ? "bg-brand/10 text-brand"
                            : v.status === "in_shop"
                            ? "bg-accent/20 text-accent-dark"
                            : "bg-ink/10 text-ink/60"
                        }`}
                      >
                        {v.status.replace("_", " ")}
                      </span>
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
