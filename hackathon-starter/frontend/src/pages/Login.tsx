import { useState, FormEvent } from "react";
import { api, User } from "../lib/api";
import { Button, ErrorBanner } from "../components/ui";

const ROLES = [
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "safety_officer", label: "Safety Officer" },
  { value: "financial_analyst", label: "Financial Analyst" },
];

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("dispatcher");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, role });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-ink">
      <div className="hidden md:flex flex-col justify-center px-16 bg-surface">
        <h1 className="font-display text-3xl font-semibold text-brand">TransitOps</h1>
        <p className="text-ink/60 mt-2">Smart Transport Operations Platform</p>
        <div className="mt-12">
          <p className="font-medium mb-3">One login, four roles:</p>
          <ul className="space-y-1 text-ink/70 text-sm">
            {ROLES.map((r) => (
              <li key={r.value}>• {r.label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 bg-white">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Sign in to your account</h2>
            <p className="text-ink/50 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && <ErrorBanner message={error} />}

          <div>
            <label className="text-xs font-medium text-ink/60">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-border rounded px-3 py-2 text-sm"
              placeholder="you@transitops.in"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60">ROLE (RBAC)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full border border-border rounded px-3 py-2 text-sm bg-white"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <p className="text-xs text-ink/40 text-center">
            Access is scoped by role after login.
          </p>
        </form>
      </div>
    </div>
  );
}
