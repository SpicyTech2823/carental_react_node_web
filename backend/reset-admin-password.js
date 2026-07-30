require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_rental",
  port: Number(process.env.DB_PORT || 3306),
  ssl:
    process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
      ? { rejectUnauthorized: false }
      : undefined,
};

async function resetAdminPassword() {
  let connection;
  try {
    console.log("🔍 Connecting to database...");
    connection = await mysql.createConnection(config);

    const adminEmail = (process.argv[2] || "admin@carental.com")
      .trim()
      .toLowerCase();
    const newPassword = process.argv[3] || "admin123";

    console.log(`🔐 Resetting password for ${adminEmail}...`);
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    const [result] = await connection.query(
      "UPDATE users SET password_hash = ? WHERE email = ? AND role = 'admin'",
      [passwordHash, adminEmail],
    );

    if (result.affectedRows === 0) {
      throw new Error(
        `No admin account found for ${adminEmail}. Set its role to 'admin' first.`,
      );
    }

    console.log(`✅ Admin password reset successfully!`);
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${newPassword}`);
    console.log(`   Password Hash: ${passwordHash}`);

    // Verify it works
    console.log("\n🔐 Testing new password...");
    const [adminUser] = await connection.query(
      "SELECT password_hash FROM users WHERE email = ? AND role = 'admin'",
      [adminEmail],
    );

    if (adminUser.length > 0) {
      const isValid = bcrypt.compareSync(
        newPassword,
        adminUser[0].password_hash,
      );
      console.log(
        `   Password test result: ${isValid ? "✅ VALID" : "❌ INVALID"}`,
      );
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

resetAdminPassword();
