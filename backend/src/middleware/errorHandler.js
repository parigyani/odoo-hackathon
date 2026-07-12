// Custom error class so routes can throw errors with a proper HTTP status
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Wrap async route handlers so thrown errors reach the error middleware
// instead of crashing the process (no more try/catch in every route)
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Express error-handling middleware — must have 4 args to be recognized
export function errorHandler(err, req, res, next) {
  console.error(err);

  // Postgres unique_violation
  if (err.code === "23505") {
    return res.status(409).json({ error: "That record already exists." });
  }
  // Postgres foreign_key_violation
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist." });
  }
  // Postgres not_null_violation
  if (err.code === "23502") {
    return res.status(400).json({ error: `Missing required field: ${err.column}` });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Something went wrong on our end." : err.message;

  res.status(statusCode).json({ error: message });
}

// 404 handler for unmatched routes
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}
