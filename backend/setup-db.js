#!/usr/bin/env node
/**
 * Database Setup Script
 * Run this once to initialize the car_rental database and tables
 *
 * Usage: node setup-db.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_rental",
};

const sqlSchema = `
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cars (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image VARCHAR(1024) DEFAULT NULL,
  category JSON DEFAULT JSON_ARRAY(),
  features JSON DEFAULT JSON_ARRAY(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  car_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  days INT UNSIGNED NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'card',
  is_paid TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_car_id (car_id),
  KEY idx_bookings_user_id (user_id),
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) DEFAULT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  car_id INT UNSIGNED DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedback_car_id (car_id),
  KEY idx_feedback_user_id (user_id),
  CONSTRAINT fk_feedback_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_admin_user (user_id),
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

async function setupDatabase() {
  let connection;
  try {
    // First, connect without specifying database to create it
    console.log("📦 Connecting to MySQL server...");
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
    });

    // Create database
    console.log("📁 Creating database...");
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log("✅ Database created successfully");

    // Switch to the new database
    await connection.query(`USE ${config.database}`);

    // Create tables
    console.log("📋 Creating tables...");
    const statements = sqlSchema.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    console.log("✅ Tables created successfully");

    // Insert sample data
    console.log("📝 Inserting sample data...");

    // Check if admin user exists
    const [existingAdmin] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
    );

    if (existingAdmin.length === 0) {
      // Create default admin user
      const adminPassword = bcrypt.hashSync("admin123", 10);
      await connection.query(
        "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
        [
          "Admin User",
          "admin@carental.com",
          adminPassword,
          "+1234567890",
          "admin",
        ],
      );
      console.log("✅ Default admin user created");
      console.log("   📧 Email: admin@carental.com");
      console.log("   🔑 Password: admin123");
    } else {
      console.log("⏭️  Admin user already exists, skipping...");
    }

    // Check if sample data already exists
    const [existingCars] = await connection.query(
      "SELECT COUNT(*) as count FROM cars",
    );

    if (existingCars[0].count === 0) {
      // Insert sample cars
      await connection.query(`
        INSERT INTO cars (name, description, price, image, category, features) VALUES 
        ('Toyota Camry', 'Comfortable sedan for daily commute', 50.00, 'https://www.carwale.com/toyota-cars/camry/', '["Business"]', '["AC", "Power Steering", "Auto Transmission"]'),
        ('Honda Civic', 'Compact and fuel-efficient car', 45.00, 'https://via.placeholder.com/400x300?text=Honda+Civic', '["Business", "Family"]', '["AC", "Power Steering"]'),
        ('SUV Explorer', 'Spacious SUV perfect for families', 80.00, 'https://via.placeholder.com/400x300?text=SUV+Explorer', '["Family", "Adventure"]', '["AC", "7 Seater", "Sunroof", "All-Terrain Tires"]')
      `);
      console.log("✅ Sample data inserted successfully");
    } else {
      console.log("⏭️  Sample data already exists, skipping...");
    }

    console.log("\n✨ Database setup completed successfully!");
    console.log("\n📝 You can now:");
    console.log("   1. Register a new user on the login page");
    console.log("   2. Login with your credentials");
    console.log("   3. Browse and book cars\n");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:");
    console.error(error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("1. Make sure MySQL server is running");
    console.error("2. Check your credentials in backend/.env:");
    console.error(`   - DB_HOST: ${config.host}`);
    console.error(`   - DB_USER: ${config.user}`);
    console.error(`   - DB_PASSWORD: ${config.password ? "***" : "(empty)"}`);
    console.error("3. Verify the MySQL service is active\n");

    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

console.log("🚀 Car Rental App - Database Setup\n");
setupDatabase();
