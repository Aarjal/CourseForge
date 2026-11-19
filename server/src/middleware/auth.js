const User = require("../models/user");
const { verifyToken } = require("../utils/jwt");

/**
 * Protect routes — verify JWT from Authorization header or cookie.
 * Attaches req.user (full user doc minus password).
 */
async function protect(req, res, next) {
  try {
    let token;

    // 1. Check Authorization: Bearer <token> header (API / mobile clients)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fall back to httpOnly cookie (browser clients)
    if (!token && req.cookies) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Not authenticated — please log in",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach the user (without password) to the request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User belonging to this token no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    // Token expired or invalid
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token expired — please refresh",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }
    next(err);
  }
}

/**
 * Restrict access to specific roles.
 * Usage: authorize("admin", "instructor")
 * Must be used AFTER protect middleware.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
}

/**
 * Optional authentication: attaches req.user if a valid token is provided,
 * but allows unauthenticated requests to continue with req.user = null.
 */
async function optionalProtect(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Non-blocking: continue as guest if token is missing/expired/invalid
  }
  next();
}

module.exports = { protect, authorize, optionalProtect };
