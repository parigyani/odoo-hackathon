<div align="center">

# 🚚 TransitOps

**Smart Transport Operations Platform**

Built for the Odoo × Mindbend Hackathon '25

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

</div>

TransitOps digitizes fleet operations end-to-end: vehicle and driver
registries, trip dispatching with automatic conflict prevention, a
maintenance workflow, fuel/expense tracking, and role-scoped analytics —
replacing the spreadsheets and logbooks most transport operators still run
on.

## Table of Contents

- [Team](#team)
- [Why this stack](#why-this-stack)
- [Architecture](#architecture)
- [The core engineering decision](#the-core-engineering-decision)
- [Role-based access control](#role-based-access-control)
- [Running it locally](#running-it-locally)
- [Screens](#screens)
- [Known scope decisions](#known-scope-decisions)
- [What we'd build next](#what-wed-build-next)

---

## Team

| Name | Role | Focus |
|---|---|---|
| [Name] | Schema & Data Integrity | Migrations, transaction safety, seed data |
| [Name] | Backend API | Vehicle/driver endpoints, request logging |
| [Name] | Frontend — Fleet Ops | Fleet, Drivers, Trips screens |
| [Name] | Frontend — Business Ops | Maintenance, Fuel & Expenses, Analytics, Settings |

---

## Why this stack

| Layer | Choice | Reasoning |
|---|---|---|
| Database | PostgreSQL 16 (Docker) | Required by the brief over Firebase/Supabase/Mongo. Strong constraint support (`CHECK`, `FK`, partial unique indexes, row locks) needed for conflict-safe dispatching. |
| Backend | Node.js + Express | Fast to build in 8 hours, team's strongest language. |
| DB access | Raw SQL via `pg` | No ORM — the schema is visible and inspectable directly in the repo rather than hidden behind generated queries. |
| Auth | `bcryptjs` + `jsonwebtoken` | Hand-rolled RBAC and account lockout, no third-party auth provider — keeps external dependencies at zero. |
| Frontend | React 19 + Vite + TypeScript | Fast dev loop, type safety across API responses. |
| Styling | Tailwind CSS | Locked design-token palette (see `frontend/tailwind.config.js`) keeps four people's UI visually consistent. |

No maps API, payment gateway, or LLM calls anywhere in this build — every
feature is self-contained relational logic.

---

## Architecture

```
transitops/
├── docker-compose.yml          # one command → local Postgres
├── backend/
│   └── src/
│       ├── migrations/         # schema + seed data (source of truth)
│       ├── db/                 # connection pool, migration runner
│       ├── middleware/         # auth (JWT), rbac, validation, error handling
│       └── routes/             # one file per resource (vehicles, drivers,
│                                  trips, maintenance, fuel-expenses, analytics)
└── frontend/
    └── src/
        ├── components/ui.tsx   # Button, Card, ErrorBanner, Spinner, EmptyState
        ├── lib/api.ts          # typed axios client, auth token handling
        └── pages/               # one page per screen
```

**Data model** — 7 tables: `users`, `vehicles`, `drivers`, `trips`,
`maintenance_logs`, `fuel_logs`, `expenses`. Full schema in
[`backend/src/migrations/001_init.sql`](backend/src/migrations/001_init.sql).

---

## The core engineering decision

Dispatching a trip has to pass four checks atomically — vehicle available,
driver available, license not expired, cargo within capacity — and flip
two records' status together. If any check fails partway through, nothing
should be written.

`POST /api/trips/:id/dispatch` runs all of this inside a single Postgres
transaction with row-level locks (`FOR UPDATE`) on the vehicle and driver
rows, so two simultaneous dispatch attempts on the same vehicle can't both
pass validation before either commits:

```js
await client.query("BEGIN");
// ...lock + validate vehicle, driver, license, capacity...
// ...update vehicle + driver status, update trip status...
await client.query("COMMIT"); // or ROLLBACK if any check throws
```

The same pattern protects maintenance status transitions
(`POST /api/maintenance`) and trip completion/cancellation.

---

## Role-based access control

| Role | Fleet | Drivers | Trips | Fuel/Expenses | Analytics |
|---|---|---|---|---|---|
| Fleet Manager | full | full | – | – | full |
| Dispatcher | view | – | full | – | – |
| Safety Officer | – | full | view | – | – |
| Financial Analyst | view | – | – | full | full |

Enforced server-side in [`backend/src/middleware/rbac.js`](backend/src/middleware/rbac.js) —
the frontend reflects these permissions but never relies on hiding a
button as the actual security boundary.

---

## Running it locally

```bash
# 1. Start Postgres (auto-runs migrations on first boot)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env      # set a real JWT_SECRET before demoing
npm install
npm run dev                # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Sign up a user via `POST /api/auth/login` with a seeded role, or use
`/api/auth/signup` to create a new one. Demo vehicles and drivers are
pre-seeded — see the seed data in `001_init.sql`.

---

## Screens

| # | Screen | Status |
|---|---|---|
| 0 | Authentication (RBAC) | ✅ |
| 1 | Dashboard | ✅ |
| 2 | Fleet / Vehicle Registry | ✅ |
| 3 | Drivers & Safety Profiles | ✅ |
| 4 | Trip Dispatcher | ✅ |
| 5 | Maintenance | ✅ |
| 6 | Fuel & Expense Management | ✅ |
| 7 | Reports & Analytics | ✅ |
| 8 | Settings & RBAC | ✅ |

*(Screenshots added below once each screen is merged.)*

<details>
<summary><strong>📸 Screenshots (click to expand)</strong></summary>
<br>

| Dashboard | Trip Dispatcher |
|---|---|
| _add screenshot_ | _add screenshot_ |

| Fleet Registry | Drivers |
|---|---|
| _add screenshot_ | _add screenshot_ |

</details>

---

## Known scope decisions

- **Vehicle ROI** (`Revenue - (Maintenance + Fuel) / Acquisition Cost`) is
  documented but not computed with live numbers — the mandatory feature
  set has no invoicing/revenue model, so we didn't fabricate a number to
  fill the formula. Flagged honestly rather than faked.
- **Settings** page is intentionally non-persistent for this build —
  general config fields are static UI, not wired to a backend update
  endpoint, since it wasn't core to the judged criteria in 8 hours.
- PDF export, email reminders, and dark mode (explicitly marked as bonus
  in the brief) were deprioritized in favor of finishing the mandatory
  feature set correctly.

---

## What we'd build next

- Overdue-return and license-expiry notifications (bonus feature, not required)
- PDF export alongside the existing CSV export
- Real-time trip tracking via WebSockets instead of manual refresh
