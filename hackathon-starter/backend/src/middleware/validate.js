import { AppError } from "./errorHandler.js";

/**
 * Minimal body validator, no external library needed.
 * Usage: validate({ name: "string", email: "string", age: "number?" })
 * Suffix a type with "?" to mark it optional.
 */
export function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rawType] of Object.entries(schema)) {
      const optional = rawType.endsWith("?");
      const type = optional ? rawType.slice(0, -1) : rawType;
      const value = req.body[field];

      if (value === undefined || value === null || value === "") {
        if (!optional) errors.push(`${field} is required`);
        continue;
      }

      if (type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string`);
      }
      if (type === "number" && typeof value !== "number") {
        errors.push(`${field} must be a number`);
      }
      if (type === "boolean" && typeof value !== "boolean") {
        errors.push(`${field} must be a boolean`);
      }
      if (type === "email" && typeof value === "string" && !/^\S+@\S+\.\S+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }

    if (errors.length > 0) {
      return next(new AppError(errors.join(", "), 422));
    }

    next();
  };
}
