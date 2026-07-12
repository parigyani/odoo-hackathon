# TransitOps — Smart Transport Operations Platform

Postgres + Express + React (TS) + Tailwind. No Firebase, Supabase, Mongo, or
external APIs — plain relational DB, your own backend, JWT auth with RBAC,
run entirely locally. Schema and routes are built from the actual problem
statement + mockups, not a generic template.

**Already built:**
- Full schema: `vehicles`, `drivers`, `trips`, `maintenance_logs`, `fuel_logs`, `expenses`, `users`
- Auth with account lockout after 5 failed attempts (matches the login mockup)
- RBAC middleware enforcing the exact permission matrix from the Settings mockup
- Trip dispatch validation (capacity check, license expiry, availability, all in one transaction)
- Maintenance auto status-flip (Available ↔ In Shop)
- Auto-computed operational cost (fuel + maintenance + expenses)
- Dashboard KPI + fleet utilization calculations
- Login screen + Dashboard screen wired end-to-end

**Still to build (routes exist, UI screens don't yet):** Fleet/Vehicle Registry
table, Drivers table, Trip Dispatcher form + Live Board, Maintenance form,
Fuel & Expenses screen, Analytics charts, Settings screen. All backend
endpoints for these are ready — it's frontend wiring from here.

## Stack

- **DB:** PostgreSQL 16 (via Docker)
- **Backend:** Node.js + Express + `pg` (raw SQL, no ORM — keeps the schema visible)
- **Frontend:** React 19 + Vite + TypeScript + Tailwind


## Project structure

```
.
├── docker-compose.yml       # one command → local Postgres
├── backend/
│   ├── src/
│   │   ├── migrations/      # your schema lives here
│   │   ├── db/               # connection pool + migration runner
│   │   ├── middleware/       # error handling + request validation
│   │   ├── routes/           # one file per resource
│   │   └── index.js          # Express app entry
├── frontend/
│   └── src/
│       ├── components/ui.tsx # Button, Card, ErrorBanner, Spinner, EmptyState
│       ├── lib/api.ts        # axios client, error normalization
│       └── App.tsx           # replace with real screens
```

#big brain comment 1 - 11 am
