const express = require("express");
const cors = require("cors");
const { clientUrl } = require("./config/env");

const app = express();
const normalizeUrl = (value) => value?.trim().replace(/\/+$/, "") || "";
const allowedOrigins = [clientUrl, "https://carentalfrontend.netlify.app", "http://localhost:5173"]
  .filter(Boolean)
  .map(normalizeUrl);
// CORS configuration
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeUrl(origin);
    if (!origin || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// Keep the original short URLs working for clients that use the Vite proxy.
app.use((req, _res, next) => {
  if (req.path === "/health") {
    req.url = "/api/health";
  } else if (["/auth", "/cars", "/bookings", "/feedback"].some((path) =>
    req.path === path || req.path.startsWith(`${path}/`)
  )) {
    req.url = `/api${req.url}`;
  }
  next();
});
// API routes
app.use("/api/health", require("./routes/health"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/cars", require("./routes/cars"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/feedback", require("./routes/feedback"));

module.exports = app;
