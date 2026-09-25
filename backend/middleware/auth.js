const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { sendError } = require("../utils/http");
const { getAuthToken } = require("../utils/request");
// Middleware to require authentication and optionally admin access
function requireAuth(req, res, next) {
  const token = getAuthToken(req);
  if (!token) {
    return sendError(res, 401, "Authorization token required");
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (_error) {
    return sendError(res, 401, "Invalid or expired token");
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, 403, "Admin access required");
  }

  return next();
}

module.exports = { requireAuth, requireAdmin };
