// Permission matrix, copied directly from the Settings & RBAC mockup.
// "full" = read/write, "view" = read-only, "none" = no access.
const PERMISSIONS = {
  fleet_manager:     { fleet: "full", drivers: "full", trips: "none", fuel_expenses: "none", analytics: "full", maintenance: "full" },
  dispatcher:        { fleet: "view", drivers: "none", trips: "full", fuel_expenses: "none", analytics: "none", maintenance: "none" },
  safety_officer:    { fleet: "none", drivers: "full", trips: "view", fuel_expenses: "none", analytics: "none", maintenance: "none" },
  financial_analyst: { fleet: "view", drivers: "none", trips: "none", fuel_expenses: "full", analytics: "full", maintenance: "none" },
};

// Usage: requirePermission("trips", "full") — blocks unless the user's role
// has at least that level of access to that module.
export function requirePermission(module, level = "view") {
  return (req, res, next) => {
    const role = req.user?.role;
    const perm = PERMISSIONS[role]?.[module] ?? "none";

    if (perm === "none") {
      return res.status(403).json({ error: `Your role (${role}) does not have access to ${module}.` });
    }
    if (level === "full" && perm !== "full") {
      return res.status(403).json({ error: `Your role (${role}) has read-only access to ${module}.` });
    }
    next();
  };
}

export { PERMISSIONS };
