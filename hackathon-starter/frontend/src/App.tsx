import { useState } from "react";
import { User } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { Button } from "./components/ui";

const NAV_ITEMS = ["Dashboard", "Fleet", "Drivers", "Trips", "Maintenance", "Fuel & Expenses", "Analytics", "Settings"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-surface border-r border-border p-4">
        <h1 className="font-display font-semibold text-brand mb-6">TransitOps</h1>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item}
              className={`px-3 py-2 rounded text-sm cursor-pointer ${
                i === 0 ? "bg-brand text-white" : "text-ink/70 hover:bg-border"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-b border-border bg-white px-6 py-3 flex items-center justify-between">
          <input
            placeholder="Search..."
            className="border border-border rounded px-3 py-1.5 text-sm w-64"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded capitalize">
              {user.role.replace("_", " ")}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.removeItem("token");
                setUser(null);
              }}
            >
              Log out
            </Button>
          </div>
        </header>

        <main className="p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
