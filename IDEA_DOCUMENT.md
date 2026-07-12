# TransitOps: Idea Document

## 1. Team Name
**Antigravity Architects**

## 2. Problem Statement
Logistics companies and fleet operators currently rely on fragmented, legacy systems to manage their day-to-day operations. Dispatchers manually track vehicles through spreadsheets, safety officers lack real-time visibility into driver status, and financial analysts struggle to reconcile trip expenses (tolls, fuel, maintenance) to calculate the true operational cost of the fleet. This fragmentation leads to high operational friction, delayed maintenance resulting in vehicle downtime, and ultimately, an inaccurate understanding of the Return on Investment (ROI) per vehicle.

## 3. Solution Overview
**TransitOps** is a comprehensive, Role-Based Access Control (RBAC) powered Smart Transport Operations Platform. It provides a unified dashboard tailored to four distinct personas:
- **Fleet Managers**: Manage the vehicle registry and schedule maintenance.
- **Dispatchers**: Queue and dispatch drivers and vehicles on active trips via a Live Board.
- **Safety Officers**: Monitor driver statuses, license renewals, and safety scores.
- **Financial Analysts**: Track fuel consumption, toll expenses, and maintenance costs to calculate true operational costs and vehicle ROI.

By centralizing the data, TransitOps eliminates data silos, ensures vehicles are not double-booked (e.g. dispatching a vehicle currently in the shop), and automates operational KPI calculations.

## 4. Tech Stack + Reasoning
- **Frontend**: React 19 + Vite + TypeScript.
  - *Reasoning*: React 19 provides the latest concurrent features and performance, while Vite ensures an extremely fast developer experience. TypeScript enforces strict API contracts between the frontend and backend, reducing runtime errors.
- **Styling**: Tailwind CSS.
  - *Reasoning*: Allows for rapid, consistent UI development without the overhead of external component libraries. We established a custom design token system (`brand`, `accent`, `ink`, `surface`) to ensure a premium, modern aesthetic out-of-the-box.
- **Backend**: Node.js + Express.
  - *Reasoning*: A lightweight and unopinionated framework that pairs perfectly with a JSON-heavy frontend.
- **Database**: PostgreSQL (via `pg` pool).
  - *Reasoning*: Relational data integrity is critical for logistics (e.g., ensuring a trip references a valid driver). Features like `FOR UPDATE` row-locking were used to prevent race conditions during concurrent maintenance logging.

## 5. Feasibility
The MVP is highly feasible and has been fully implemented in this repository. 
- **Data Model**: The schema is normalized and robust, handling the complex interplay between vehicles, drivers, trips, and expenses.
- **Scalability**: By utilizing connection pooling and simple stateless JWT authentication, the backend can be horizontally scaled with ease. 
- **Future Scope**: The platform is designed to seamlessly integrate with IoT (GPS tracking, OBD2 vehicle telemetry) and accounting software in future enterprise iterations. For instance, the ROI calculation currently relies on cost data, but can easily incorporate invoicing/revenue metrics once integrated with an ERP.

## 6. UI/UX Summary
The UI is designed to be highly functional yet visually premium. We avoided generic Bootstrap styles in favor of a bespoke, glassmorphism-inspired design system with micro-animations on hover states. The application relies on a single-page architecture (SPA) with a persistent sidebar, ensuring users never lose context while navigating between modules.

### Screenshots

*(Replace the placeholder image paths below with actual screenshots of your local application)*

**Login & Role Selection**
![Login Screen](./screenshots/login.png)

**Dispatcher Live Board (Trips)**
![Trips Dashboard](./screenshots/trips.png)

**Fleet Management & Registry**
![Fleet Registry](./screenshots/fleet.png)

**Analytics & Cost Reporting**
![Analytics Dashboard](./screenshots/analytics.png)

**Fuel & Expenses Tracking**
![Fuel and Expenses](./screenshots/fuel.png)

**Maintenance Logging**
![Maintenance](./screenshots/maintenance.png)

---
*Built for the TransitOps Hackathon.*
