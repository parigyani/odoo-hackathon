import { PageHeader, Card, Button } from "../components/ui";

const PERMISSIONS = {
  fleet_manager: { fleet: "full", drivers: "full", trips: "none", fuel_expenses: "none", analytics: "full", maintenance: "full" },
  dispatcher: { fleet: "view", drivers: "none", trips: "full", fuel_expenses: "none", analytics: "none", maintenance: "none" },
  safety_officer: { fleet: "none", drivers: "full", trips: "view", fuel_expenses: "none", analytics: "none", maintenance: "none" },
  financial_analyst: { fleet: "view", drivers: "none", trips: "none", fuel_expenses: "full", analytics: "full", maintenance: "none" },
};

const MODULES = ["fleet", "drivers", "trips", "fuel_expenses", "analytics", "maintenance"] as const;
const ROLES = ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"] as const;

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <PageHeader title="Settings" subtitle="System configuration and access control" />
        <Button onClick={() => alert("Settings saved successfully (Demo)")}>Save Changes</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GENERAL SETTINGS (Static) */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-ink border-b border-border pb-2">General Configuration</h3>
            
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">DEPOT NAME</label>
              <input type="text" defaultValue="TransitOps Central Hub" className="w-full border border-border rounded px-3 py-2 text-sm bg-canvas/30" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">CURRENCY</label>
              <select className="w-full border border-border rounded px-3 py-2 text-sm bg-canvas/30">
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">DISTANCE UNIT</label>
              <select className="w-full border border-border rounded px-3 py-2 text-sm bg-canvas/30">
                <option value="KM">Kilometers (km)</option>
                <option value="MI">Miles (mi)</option>
              </select>
            </div>
          </Card>
        </div>

        {/* RBAC MATRIX */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-ink">Role-Based Access Control (RBAC)</h3>
              <p className="text-sm text-ink/60 mt-1">
                Permission matrix defining module access levels across the platform. This is read-only for the demo.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border bg-canvas/50">
                    <th className="px-4 py-3 font-medium text-ink/60">MODULE</th>
                    {ROLES.map((role) => (
                      <th key={role} className="px-4 py-3 font-medium text-ink/60 uppercase">
                        {role.replace("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MODULES.map((mod) => (
                    <tr key={mod} className="hover:bg-canvas/30 transition-colors">
                      <td className="px-4 py-3 font-medium uppercase text-ink/80">{mod.replace("_", " ")}</td>
                      {ROLES.map((role) => {
                        const perm = PERMISSIONS[role][mod as keyof typeof PERMISSIONS[typeof role]];
                        return (
                          <td key={role} className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                              perm === "full" ? "bg-success/10 text-success border-success/20" :
                              perm === "view" ? "bg-warning/10 text-warning border-warning/20" :
                              "bg-ink/5 text-ink/40 border-ink/10"
                            }`}>
                              {perm.toUpperCase()}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex gap-4 text-xs text-ink/50 bg-canvas/50 p-3 rounded">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> FULL: Read & Write</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning"></span> VIEW: Read Only</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ink/20"></span> NONE: Hidden</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
