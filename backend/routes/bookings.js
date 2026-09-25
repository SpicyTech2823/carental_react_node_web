const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { getAuthToken } = require("../utils/request");
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { sendError } = require("../utils/http");

// GET /api/bookings - Get all bookings (admin only)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.car_id, b.user_id, b.customer_name, b.email, b.phone, b.pickup_date, b.return_date, b.days, b.total_price, b.payment_method, b.is_paid, b.created_at, c.name AS car_name, c.image AS car_image
     FROM bookings b
     LEFT JOIN cars c ON b.car_id = c.id
     ORDER BY b.created_at DESC`,
  );
  return res.json({ bookings: rows });
});
// POST /api/bookings - Create a new booking
router.post("/", async (req, res) => {
  const {
    car_id,
    customer_name,
    email,
    phone,
    pickup_date,
    return_date,
    days,
    total_price,
    payment_method,
    is_paid,
  } = req.body;
  if (!car_id || !customer_name || !email || !pickup_date || !return_date) {
    return sendError(
      res,
      400,
      "Booking must include car, name, email, pickup date, and return date",
    );
  }

  const token = getAuthToken(req);
  let userId = null;
  if (token) {
    try {
      userId = jwt.verify(token, jwtSecret).id;
    } catch (err) {
      userId = null;
    }
  }

  await pool.query(
    "INSERT INTO bookings (car_id, user_id, customer_name, email, phone, pickup_date, return_date, days, total_price, payment_method, is_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      car_id,
      userId,
      customer_name.trim(),
      email.trim(),
      phone || "",
      pickup_date,
      return_date,
      parseInt(days || 1, 10),
      parseFloat(total_price || 0),
      payment_method || "card",
      is_paid ? 1 : 0,
    ],
  );

  return res.json({ message: "Booking created successfully" });
});

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { is_paid } = req.body;
    await pool.query("UPDATE bookings SET is_paid = ? WHERE id = ?", [
      is_paid ? 1 : 0,
      id,
    ]);
    return res.json({ message: "Booking updated successfully" });
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    await pool.query("DELETE FROM bookings WHERE id = ?", [req.params.id]);
    return res.json({ message: "Booking deleted successfully" });
  },
);

module.exports = router;
