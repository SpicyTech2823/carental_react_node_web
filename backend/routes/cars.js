const { normalizeArray } = require("../utils/request");
const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { sendError } = require("../utils/http");
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, description, price, image, category, features FROM cars ORDER BY id",
  );
  return res.json({
    cars: rows.map((car) => ({
      ...car,
      category:
        typeof car.category === "string"
          ? JSON.parse(car.category || "[]")
          : car.category || [],
      features:
        typeof car.features === "string"
          ? JSON.parse(car.features || "[]")
          : car.features || [],
    })),
  });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, price, image, category, features } = req.body;
  if (!name || !description || !price) {
    return sendError(res, 400, "Name, description, and price are required");
  }

  const categories = normalizeArray(category);
  const featuresArray = normalizeArray(features);
  const [result] = await pool.query(
    "INSERT INTO cars (name, description, price, image, category, features) VALUES (?, ?, ?, ?, ?, ?)",
    [
      name.trim(),
      description.trim(),
      parseFloat(price),
      image || "",
      JSON.stringify(categories),
      JSON.stringify(featuresArray),
    ],
  );

  return res.json({
    car: {
      id: result.insertId,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: image || "",
      category: categories,
      features: featuresArray,
    },
  });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, features } = req.body;
  const categories = normalizeArray(category);
  const featuresArray = normalizeArray(features);
  await pool.query(
    "UPDATE cars SET name = ?, description = ?, price = ?, image = ?, category = ?, features = ? WHERE id = ?",
    [
      name.trim(),
      description.trim(),
      parseFloat(price),
      image || "",
      JSON.stringify(categories),
      JSON.stringify(featuresArray),
      id,
    ],
  );
  return res.json({ message: "Car updated successfully" });
});

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    await pool.query("DELETE FROM cars WHERE id = ?", [req.params.id]);
    return res.json({ message: "Car deleted successfully" });
  },
);

module.exports = router;
