const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const { getAuthToken } = require("../utils/request");
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { sendError } = require("../utils/http");
router.get("/", async (req, res) => {
  const featured = req.query.featured === "true";
  const [rows] = await pool.query(
    `SELECT f.id, f.user_id, f.user_name, f.user_email, f.rating, f.comment, f.car_id, f.is_featured, f.created_at, c.name AS car_name
     FROM feedback f
     LEFT JOIN cars c ON f.car_id = c.id
     ${featured ? "WHERE f.is_featured = 1" : ""}
     ORDER BY f.created_at DESC`,
  );
  return res.json({ feedback: rows });
});

router.post("/", async (req, res) => {
  const { user_name, rating, comment, car_id, user_email } = req.body;
  if (!user_name || !rating || !comment) {
    return sendError(res, 400, "Name, rating, and comment are required");
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
    "INSERT INTO feedback (user_id, user_name, user_email, rating, comment, car_id, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      userId,
      user_name.trim(),
      user_email || "",
      parseInt(rating, 10),
      comment.trim(),
      car_id || null,
      0,
    ],
  );
  return res.json({ message: "Feedback submitted successfully" });
});

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { is_featured } = req.body;
    await pool.query("UPDATE feedback SET is_featured = ? WHERE id = ?", [
      is_featured ? 1 : 0,
      id,
    ]);
    return res.json({ message: "Feedback updated successfully" });
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    await pool.query("DELETE FROM feedback WHERE id = ?", [req.params.id]);
    return res.json({ message: "Feedback deleted successfully" });
  },
);

module.exports = router;
