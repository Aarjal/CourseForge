function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // CORS Error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      error: "Not allowed by CORS",
      message: "Origin is not allowed access by CORS policy",
    });
  }

  // Mongoose CastError (invalid ObjectId or type casting)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Bad Request",
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Mongoose Schema Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: "Validation Error",
      message: messages.join("; "),
      errors: messages,
    });
  }

  // Zod Validation Error (Zod 4 uses `issues`, not `errors`)
  if (err.name === "ZodError") {
    const formattedErrors = (err.issues || []).map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({
      error: "Validation Error",
      message: formattedErrors.map((e) => `${e.field}: ${e.message}`).join("; "),
      errors: formattedErrors,
    });
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      error: "Conflict",
      message: `Duplicate value for ${field}`,
    });
  }

  // Explicit operational status code
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : "Error",
    message,
  });
}

module.exports = errorHandler;
