require("dotenv").config();

const port = Number(process.env.PORT || 3000);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const jwtSecret = process.env.JWT_SECRET || "change-this-secret";

module.exports = { port, clientUrl, jwtSecret };
