/**
 * Seed script: creates an admin user if one doesn't already exist.
 *
 * Usage: npm run seed:admin
 *
 * Reads credentials from environment variables:
 *   ADMIN_NAME  (default: "Admin")
 *   ADMIN_EMAIL (default: "admin@courseforge.dev")
 *   ADMIN_PASSWORD (default: "admin123")
 *
 * In production, ALWAYS override these defaults via your .env file.
 */
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/user");

const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@courseforge.dev";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${existing.email} (role: ${existing.role})`);
  } else {
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin user created: ${admin.email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
