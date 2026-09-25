const mysql = require("mysql2/promise");

function getDatabaseConfig(includeDatabase = true) {
  const ssl = process.env.DB_SSL === "true" || process.env.DB_SSL === "1"
    ? { rejectUnauthorized: false }
    : undefined;

  if (process.env.DB_URL) {
    const databaseUrl = new URL(process.env.DB_URL);
    const config = {
      host: databaseUrl.hostname,
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      port: Number(databaseUrl.port || 3306),
      ssl,
    };

    if (includeDatabase) {
      config.database = databaseUrl.pathname.replace(/^\/+/, "");
    }
    return config;
  }

  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: Number(process.env.DB_PORT || 3306),
    ssl,
  };

  if (includeDatabase) {
    config.database = process.env.DB_NAME || "car_rental";
  }
  return config;
}

const pool = mysql.createPool(getDatabaseConfig());

module.exports = { getDatabaseConfig, pool };
