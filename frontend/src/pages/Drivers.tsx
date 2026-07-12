import { useEffect, useState } from "react";
import { api, Driver } from "../lib/api";
import { Card, ErrorBanner, Spinner, Button, EmptyState } from "../components/ui";

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    license_number: "",
    license_category: "LMV",
    license_expiry: "",
    contact_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Driver[]>("/drivers");
      setDrivers(res.data);
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
      await api.post("/drivers", {
        name: addForm.name,
        license_number: addForm.license_number,
        license_category: addForm.license_category,
        license_expiry: addForm.license_expiry,
        contact_number: addForm.contact_number,
      });
      setShowAddForm(false);
      setAddForm({
        name: "",
        license_number: "",
        license_category: "LMV",
        license_expiry: "",
        contact_number: "",
      });
      load();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      // Rotate status for demo purposes, or prompt user. Let's cycle through available/off_duty/suspended
      let nextStatus = "available";
      if (currentStatus === "available") nextStatus = "off_duty";
      else if (currentStatus === "off_duty") nextStatus = "suspended";
      
      // Don't toggle if on_trip
      if (currentStatus === "on_trip") return;

      await api.patch(`/drivers/${id}/status`, { status: nextStatus });
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const filteredDrivers = drivers.filter(d => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!d.name.toLowerCase().includes(s) && !d.license_number.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Drivers Directory</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "+ Add Driver"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">License No</label>
                <input
                  required
                  value={addForm.license_number}
                  onChange={(e) => setAddForm({ ...addForm, license_number: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={addForm.license_category}
                  onChange={(e) => setAddForm({ ...addForm, license_category: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm bg-surface"
                >
                  <option value="LMV">LMV</option>
                  <option value="HMV">HMV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  required
                  type="date"
                  value={addForm.license_expiry}
                  onChange={(e) => setAddForm({ ...addForm, license_expiry: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact No</label>
                <input
                  required
                  value={addForm.contact_number}
                  onChange={(e) => setAddForm({ ...addForm, contact_number: e.target.value })}
                  className="w-full border border-border rounded px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            {addError && <ErrorBanner message={addError} />}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Driver"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            placeholder="Search Name or License..."
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
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="off_duty">Off Duty</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorBanner message={error} onRetry={load} />
        ) : filteredDrivers.length === 0 ? (
          <EmptyState title="No drivers found matching filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-sm text-ink/70">
                  <th className="py-2 px-3 font-medium">Name</th>
                  <th className="py-2 px-3 font-medium">License No</th>
                  <th className="py-2 px-3 font-medium">Category</th>
                  <th className="py-2 px-3 font-medium">Expiry</th>
                  <th className="py-2 px-3 font-medium">Contact</th>
                  <th className="py-2 px-3 font-medium">Safety Score</th>
                  <th className="py-2 px-3 font-medium text-right">Status</th>
                  <th className="py-2 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredDrivers.map((d) => (
                  <tr key={d.id} className="border-b border-border/50 hover:bg-canvas">
                    <td className="py-3 px-3 font-medium">{d.name}</td>
                    <td className="py-3 px-3">{d.license_number}</td>
                    <td className="py-3 px-3">{d.license_category}</td>
                    <td className="py-3 px-3">{new Date(d.license_expiry).toLocaleDateString()}</td>
                    <td className="py-3 px-3">{d.contact_number}</td>
                    <td className="py-3 px-3">{d.safety_score ?? 100}/100</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                          d.status === "available"
                            ? "bg-success/10 text-success"
                            : d.status === "on_trip"
                            ? "bg-brand/10 text-brand"
                            : d.status === "off_duty"
                            ? "bg-accent/20 text-accent-dark"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {d.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                       <button
                         onClick={() => handleStatusToggle(d.id, d.status)}
                         disabled={d.status === "on_trip"}
                         className="text-xs font-medium underline text-ink/60 hover:text-ink disabled:opacity-30"
                       >
                         Toggle Status
                       </button>
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
