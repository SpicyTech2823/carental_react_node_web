const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtSecret } = require("../config/env");
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { sendError } = require("../utils/http");
// Create a JWT token for the user
function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: "7d" },
  );
}
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
    );
    if (existingUsers.length > 0) {
      return sendError(res, 409, "Email already registered");
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, phone || "", "user"],
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || "",
      role: "user",
    };

    return res.json({ token: createToken(user), user });
  } catch (err) {
    console.error("Register error:", err);
    return sendError(
      res,
      500,
      "Unable to register. Please check the server database connection.",
    );
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, password_hash FROM users WHERE email = ?",
      [normalizedEmail],
    );
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return sendError(res, 401, "Email or password is incorrect");
    }

    return res.json({
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return sendError(
      res,
      500,
      "Unable to sign in. Please check the server database connection.",
    );
  }
});

router.get("/profile", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
    [req.user.id],
  );
  const user = rows[0];
  if (!user) {
    return sendError(res, 404, "User not found");
  }
  return res.json({ user });
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, "Email and new password are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
    normalizedEmail,
  ]);
  const user = rows[0];
  if (!user) {
    return sendError(res, 404, "No account found for that email");
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
    passwordHash,
    user.id,
  ]);
  return res.json({ message: "Password has been updated successfully" });
});

module.exports = router;
