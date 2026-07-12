import { useEffect, useState, FormEvent } from "react";
import { api, FuelLog, Expense, OperationalCost, Vehicle } from "../lib/api";
import { PageHeader, Card, Button, LoadingSpinner, ErrorBanner } from "../components/ui";

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [opCosts, setOpCosts] = useState<OperationalCost[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fuel Form state
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelVehicle, setFuelVehicle] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [fuelSubmitting, setFuelSubmitting] = useState(false);
  const [fuelError, setFuelError] = useState<string | null>(null);

  // Expense Form state
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expVehicle, setExpVehicle] = useState("");
  const [expToll, setExpToll] = useState("");
  const [expOther, setExpOther] = useState("");
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [expError, setExpError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fuelRes, expRes, opRes, vehRes] = await Promise.all([
        api.get("/fuel-expenses/fuel-logs"),
        api.get("/fuel-expenses/expenses"),
        api.get("/fuel-expenses/operational-cost"),
        api.get("/vehicles")
      ]);
      setFuelLogs(fuelRes.data);
      setExpenses(expRes.data);
      setOpCosts(opRes.data);
      setVehicles(vehRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load fuel & expenses data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogFuel = async (e: FormEvent) => {
    e.preventDefault();
    setFuelError(null);
    setFuelSubmitting(true);
    try {
      await api.post("/fuel-expenses/fuel-logs", {
        vehicle_id: fuelVehicle,
        liters: Number(fuelLiters),
        cost: Number(fuelCost),
        logged_at: fuelDate,
      });
      setShowFuelForm(false);
      setFuelVehicle("");
      setFuelLiters("");
      setFuelCost("");
      setFuelDate("");
      fetchData(); // refresh tables
    } catch (err: any) {
      setFuelError(err.message || "Failed to log fuel.");
    } finally {
      setFuelSubmitting(false);
    }
  };

  const handleAddExpense = async (e: FormEvent) => {
    e.preventDefault();
    setExpError(null);
    setExpSubmitting(true);
    try {
      await api.post("/fuel-expenses/expenses", {
        vehicle_id: expVehicle,
        toll: Number(expToll) || 0,
        other: Number(expOther) || 0,
      });
      setShowExpenseForm(false);
      setExpVehicle("");
      setExpToll("");
      setExpOther("");
      fetchData(); // refresh tables
    } catch (err: any) {
      setExpError(err.message || "Failed to add expense.");
    } finally {
      setExpSubmitting(false);
    }
  };

  if (loading && fuelLogs.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  // Calculate fleet totals
  const totalFuel = opCosts.reduce((sum, c) => sum + Number(c.fuel_cost), 0);
  const totalMaint = opCosts.reduce((sum, c) => sum + Number(c.maintenance_cost), 0);
  const totalExp = opCosts.reduce((sum, c) => sum + Number(c.expense_total), 0);
  const grandTotal = totalFuel + totalMaint + totalExp;

  return (
    <div className="space-y-6">
      <PageHeader title="Fuel & Expenses" subtitle="Monitor operational costs and log fuel consumption" />

      {/* OPERATIONAL COSTS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-brand text-white">
          <h4 className="text-xs font-medium opacity-80 uppercase">Total Operational Cost</h4>
          <p className="text-2xl font-display font-semibold mt-1">₹{grandTotal.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-xs font-medium text-ink/60 uppercase">Total Fuel Cost</h4>
          <p className="text-xl font-display font-semibold mt-1 text-ink">₹{totalFuel.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-xs font-medium text-ink/60 uppercase">Total Maintenance</h4>
          <p className="text-xl font-display font-semibold mt-1 text-ink">₹{totalMaint.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <h4 className="text-xs font-medium text-ink/60 uppercase">Tolls & Misc Expenses</h4>
          <p className="text-xl font-display font-semibold mt-1 text-ink">₹{totalExp.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FUEL LOGS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-ink">Fuel Logs</h3>
            <Button onClick={() => setShowFuelForm(!showFuelForm)} variant="secondary" className="text-xs">
              {showFuelForm ? "Cancel" : "+ Log Fuel"}
            </Button>
          </div>

          {showFuelForm && (
            <Card className="p-5 border-brand/20 shadow-sm">
              <h4 className="font-medium mb-3 text-sm">Log Fuel Entry</h4>
              {fuelError && <ErrorBanner message={fuelError} className="mb-3" />}
              <form onSubmit={handleLogFuel} className="space-y-3">
                <div>
                  <select required value={fuelVehicle} onChange={e => setFuelVehicle(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm bg-white">
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <input required type="number" step="0.1" min="0" placeholder="Liters" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} className="flex-1 border border-border rounded px-3 py-2 text-sm" />
                  <input required type="number" step="0.01" min="0" placeholder="Cost (₹)" value={fuelCost} onChange={e => setFuelCost(e.target.value)} className="flex-1 border border-border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <input required type="date" value={fuelDate} onChange={e => setFuelDate(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm" />
                </div>
                <Button type="submit" disabled={fuelSubmitting} className="w-full text-sm py-2">
                  {fuelSubmitting ? "Saving..." : "Save Fuel Log"}
                </Button>
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
                    <th className="px-4 py-3 font-medium text-ink/60 text-right">LITERS</th>
                    <th className="px-4 py-3 font-medium text-ink/60 text-right">COST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fuelLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-ink/50">No fuel logs found.</td></tr>
                  ) : (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-canvas/30 transition-colors">
                        <td className="px-4 py-3">{new Date(log.logged_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{log.vehicle_name}</td>
                        <td className="px-4 py-3 text-right">{Number(log.liters).toFixed(1)} L</td>
                        <td className="px-4 py-3 text-right font-medium">₹{Number(log.cost).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* EXPENSES SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-ink">Trip & Misc Expenses</h3>
            <Button onClick={() => setShowExpenseForm(!showExpenseForm)} variant="secondary" className="text-xs">
              {showExpenseForm ? "Cancel" : "+ Add Expense"}
            </Button>
          </div>

          {showExpenseForm && (
            <Card className="p-5 border-brand/20 shadow-sm">
              <h4 className="font-medium mb-3 text-sm">Add Expense Entry</h4>
              {expError && <ErrorBanner message={expError} className="mb-3" />}
              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <select required value={expVehicle} onChange={e => setExpVehicle(e.target.value)} className="w-full border border-border rounded px-3 py-2 text-sm bg-white">
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <input type="number" step="0.01" min="0" placeholder="Tolls (₹)" value={expToll} onChange={e => setExpToll(e.target.value)} className="flex-1 border border-border rounded px-3 py-2 text-sm" />
                  <input type="number" step="0.01" min="0" placeholder="Other Misc (₹)" value={expOther} onChange={e => setExpOther(e.target.value)} className="flex-1 border border-border rounded px-3 py-2 text-sm" />
                </div>
                <p className="text-xs text-ink/50 mt-1">Leave blank if zero. Trip-level assignments can be added from the Live Board.</p>
                <Button type="submit" disabled={expSubmitting} className="w-full text-sm py-2">
                  {expSubmitting ? "Saving..." : "Save Expense"}
                </Button>
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
                    <th className="px-4 py-3 font-medium text-ink/60">TRIP</th>
                    <th className="px-4 py-3 font-medium text-ink/60 text-right">TOLL</th>
                    <th className="px-4 py-3 font-medium text-ink/60 text-right">OTHER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-ink/50">No expenses found.</td></tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-canvas/30 transition-colors">
                        <td className="px-4 py-3">{new Date(exp.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{exp.vehicle_name}</td>
                        <td className="px-4 py-3 text-ink/60">{exp.trip_code || "—"}</td>
                        <td className="px-4 py-3 text-right">₹{Number(exp.toll).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">₹{Number(exp.other).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
