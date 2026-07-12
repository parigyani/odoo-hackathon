import { useState, useEffect } from "react";
import { User } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import FuelExpenses from "./pages/FuelExpenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { Button } from "./components/ui";

import Landing from "./pages/Landing";

const NAV_ITEMS = ["Dashboard", "Fleet", "Drivers", "Trips", "Maintenance", "Fuel & Expenses", "Analytics", "Settings"];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  if (!user) {
    if (showLogin) return <Login onLogin={setUser} />;
    return <Landing onSignIn={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-surface border-r border-border p-4">
        <h1 className="font-display font-semibold text-brand mb-6">TransitOps</h1>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              onClick={() => setActivePage(item)}
              className={`px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
                activePage === item ? "bg-brand text-white" : "text-ink/70 hover:bg-border"
              }`}
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between shrink-0">
          <input
            placeholder="Search..."
            className="border border-border rounded px-3 py-1.5 text-sm w-64"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded capitalize">
              {user.role.replace("_", " ")}
            </span>
            <Button variant="secondary" onClick={() => setIsDark(!isDark)}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </Button>
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

        <main className="flex-1 p-6 overflow-y-auto bg-canvas">
          {activePage === "Dashboard" && <Dashboard />}
          {activePage === "Fleet" && <Fleet />}
          {activePage === "Drivers" && <Drivers />}
          {activePage === "Trips" && <Trips />}
          {activePage === "Maintenance" && <Maintenance />}
          {activePage === "Fuel & Expenses" && <FuelExpenses />}
          {activePage === "Analytics" && <Analytics />}
          {activePage === "Settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}
