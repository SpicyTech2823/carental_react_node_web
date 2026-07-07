require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_rental",
};

async function verifyAdmin() {
  let connection;
  try {
    console.log("🔍 Connecting to database...");
    connection = await mysql.createConnection(config);

    console.log(`✅ Connected to ${config.database} database\n`);

    // Check all users
    console.log("📋 All users in database:");
    const [allUsers] = await connection.query(
      "SELECT id, name, email, role FROM users",
    );
    console.log(allUsers);

    // Check for admin specifically
    console.log("\n🔐 Looking for admin user...");
    const [adminUsers] = await connection.query(
      "SELECT id, name, email, role, password_hash FROM users WHERE role = 'admin'",
    );

    if (adminUsers.length === 0) {
      console.log("❌ No admin user found!");

      // Create one now
      console.log("\n➕ Creating admin user now...");
      const adminPassword = bcrypt.hashSync("admin123", 10);
      console.log(`   Password hash: ${adminPassword}`);

      const [result] = await connection.query(
        "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)",
        [
          "Admin User",
          "admin@carental.com",
          adminPassword,
          "+1234567890",
          "admin",
        ],
      );

      console.log("✅ Admin user created successfully!");
      console.log("   📧 Email: admin@carental.com");
      console.log("   🔑 Password: admin123");
    } else {
      console.log("✅ Admin user exists:");
      adminUsers.forEach((user) => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Password Hash: ${user.password_hash}`);
      });

      // Test the password
      console.log("\n🔐 Testing password...");
      const testPassword = "admin123";
      const isValid = bcrypt.compareSync(
        testPassword,
        adminUsers[0].password_hash,
      );
      console.log(`   Password 'admin123' valid: ${isValid}`);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

verifyAdmin();
