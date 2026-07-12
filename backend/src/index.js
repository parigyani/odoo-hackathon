import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import { vehiclesRouter } from "./routes/vehicles.js";
import { driversRouter } from "./routes/drivers.js";
import { tripsRouter } from "./routes/trips.js";
import { maintenanceRouter } from "./routes/maintenance.js";
import { fuelExpensesRouter } from "./routes/fuelExpenses.js";
import { analyticsRouter } from "./routes/analytics.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/trips", tripsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/fuel-expenses", fuelExpensesRouter);
app.use("/api/analytics", analyticsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`TransitOps API running on http://localhost:${PORT}`));
