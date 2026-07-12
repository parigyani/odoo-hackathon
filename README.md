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

## 1. First-time setup (do this before the hackathon starts)

```bash
# Start Postgres (runs migrations automatically on first boot)
docker compose up -d

# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

Visit `http://localhost:5173` — you should see a demo "Items" list pulled
straight from Postgres. If it loads, your whole stack is wired correctly.

If you ever need to re-run migrations against a DB that's already running
(e.g. you added a new `.sql` file instead of resetting the container):

```bash
cd backend && npm run migrate
```

## 2. Once the problem statement is announced

1. **Sketch the ER diagram first** (15–20 min, paper or Excalidraw). This is
   graded — don't skip it.
2. Replace `backend/src/migrations/001_init.sql` with your real schema.
   Keep the patterns: UUID primary keys, `ON DELETE` behavior on every FK,
   `CHECK` constraints for enums, indexes on FK/filter columns, junction
   tables for many-to-many.
3. Copy `backend/src/routes/items.js` as the template for each new
   resource's routes (list / get / create / update / delete).
4. Copy patterns in `frontend/src/App.tsx` (loading / error / empty states)
   for every new screen — judges explicitly want to see error handling, not
   just the happy path.
5. Keep all colors to the palette defined in `frontend/tailwind.config.js`
   (`brand`, `accent`, `ink`, `canvas`, `surface`, `border`). Don't
   freestyle new hex values — it's what keeps the UI consistent across 3
   people building different screens.

## 3. Git workflow (for 3 people, 8 hours)

```bash
git init
git add .
git commit -m "chore: starter kit setup"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

Then each person works on a feature branch and merges via PR, so the commit
history actually shows 3 contributors (this is explicitly graded):

```bash
git checkout -b feature/<your-name>-<feature>
# ... work, commit in small chunks with clear messages ...
git push -u origin feature/<your-name>-<feature>
# open a PR into main, merge once it runs locally for whoever reviews
```

Suggested split once the idea is picked:
- **Person A:** schema + migrations + backend routes for entity 1
- **Person B:** backend routes for entity 2/3 + validation
- **Person C:** frontend screens + wiring to API

Commit early and often — a single "final commit" at hour 7 looks bad even
if the code is good.

## 4. Before recording the demo video

- [ ] Real Postgres data on screen, not hardcoded JSON in the frontend
- [ ] Trigger at least one error on camera (e.g. submit an empty form) and
      show the UI handling it gracefully — this directly hits their "user
      errors" criterion
- [ ] `README.md` updated with your actual project name, schema summary,
      and an ER diagram image
- [ ] `.env` is NOT committed (check `.gitignore` did its job)
- [ ] Everyone's commits are visible in `git log`

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
