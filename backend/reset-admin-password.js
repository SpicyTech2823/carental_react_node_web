require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_rental",
};

async function resetAdminPassword() {
  let connection;
  try {
    console.log("🔍 Connecting to database...");
    connection = await mysql.createConnection(config);

    console.log("🔐 Resetting admin password...");
    const newPassword = "admin123";
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    const [result] = await connection.query(
      "UPDATE users SET password_hash = ? WHERE role = 'admin'",
      [passwordHash],
    );

    console.log(`✅ Admin password reset successfully!`);
    console.log(`   📧 Email: admin@gmail.com`);
    console.log(`   🔑 Password: ${newPassword}`);
    console.log(`   Password Hash: ${passwordHash}`);

    // Verify it works
    console.log("\n🔐 Testing new password...");
    const [adminUser] = await connection.query(
      "SELECT password_hash FROM users WHERE role = 'admin' LIMIT 1",
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
