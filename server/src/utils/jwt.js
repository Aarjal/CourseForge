const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "15m";
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

/**
 * Generate a short-lived access token.
 * Payload: { id, role }
 */
function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

/**
 * Generate a long-lived refresh token.
 * Payload: { id } — no role (re-read from DB on refresh)
 */
function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws on invalid/expired tokens.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
