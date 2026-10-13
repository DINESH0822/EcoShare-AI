/**
 * Script to provision or verify an initial Admin user for EcoShare AI.
 * Usage: node scripts/provisionAdmin.js
 * 
 * Reads credentials from environment variables:
 * ADMIN_EMAIL (default: admin@ecoshare.org)
 * ADMIN_PASSWORD (default: Admin@EcoShare2025!)
 * ADMIN_NAME (default: EcoShare Administrator)
 */

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ecoshare.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@EcoShare2025!";
const ADMIN_NAME = process.env.ADMIN_NAME || "System Administrator";

async function provisionAdmin() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Error: MONGO_URI is not defined in .env");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    let admin = await User.findOne({ email: normalizedEmail });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (admin) {
      console.log(`User '${normalizedEmail}' already exists. Updating role to Admin...`);
      admin.role = "Admin";
      admin.name = ADMIN_NAME;
      admin.password = hashedPassword;
      admin.isActive = true;
      await admin.save();
      console.log(`Successfully updated existing user '${normalizedEmail}' to Admin role.`);
    } else {
      console.log(`Creating initial Admin user '${normalizedEmail}'...`);
      admin = await User.create({
        name: ADMIN_NAME,
        email: normalizedEmail,
        password: hashedPassword,
        phone: "9999999999",
        role: "Admin",
        isActive: true,
        address: "EcoShare AI HQ",
        city: "Mumbai"
      });
      console.log(`Successfully provisioned Admin user '${normalizedEmail}'.`);
    }

    console.log("-----------------------------------------");
    console.log("Admin provisioned successfully:");
    console.log(`Email: ${normalizedEmail}`);
    console.log("Role: Admin");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("Failed to provision admin user:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

provisionAdmin();
