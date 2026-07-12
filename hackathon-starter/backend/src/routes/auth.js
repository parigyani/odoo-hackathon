import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/pool.js";
import { asyncHandler, AppError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const LOCK_THRESHOLD = 5;
const LOCK_MINUTES = 15;

authRouter.post(
  "/signup",
  validate({ name: "string", email: "email", password: "string", role: "string" }),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    const validRoles = ["fleet_manager", "dispatcher", "safety_officer", "financial_analyst"];
    if (!validRoles.includes(role)) {
      throw new AppError(`role must be one of: ${validRoles.join(", ")}`, 422);
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [name, email, hash, role]
    );
    res.status(201).json(result.rows[0]);
  })
);

authRouter.post(
  "/login",
  validate({ email: "email", password: "string", role: "string" }),
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // Same generic message whether the email doesn't exist or the password is wrong —
    // never reveal which one to avoid leaking valid emails.
    const invalidCredsError = () => new AppError("Invalid credentials.", 401);

    if (!user) throw invalidCredsError();

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minsLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      throw new AppError(`Account locked. Try again in ${minsLeft} minute(s).`, 423);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const attempts = user.failed_attempts + 1;
      const locked = attempts >= LOCK_THRESHOLD;
      await query(
        `UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3`,
        [locked ? 0 : attempts, locked ? new Date(Date.now() + LOCK_MINUTES * 60000) : null, user.id]
      );
      if (locked) {
        throw new AppError(`Account locked after ${LOCK_THRESHOLD} failed attempts.`, 423);
      }
      throw invalidCredsError();
    }

    if (user.role !== role) {
      throw new AppError(`This account is registered as ${user.role}, not ${role}.`, 403);
    }

    // Successful login resets the lockout counter
    await query(`UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`, [user.id]);

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  })
);
