import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header.", 401));
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    next(new AppError("Invalid or expired token.", 401));
  }
}
