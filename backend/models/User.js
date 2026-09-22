const mongoose = require("mongoose");

const ROLES = ["Admin", "Donor", "NGO", "Volunteer"];

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ROLES,
      default: "Donor"
    },

    // Optional profile fields
    phone: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },

    // Donor-specific
    donorType: { type: String, default: "" },
    businessName: { type: String, default: "" },

    // Location (optional)
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },

    // Verification badges
    verificationBadges: [{ type: String }],

    // NGO association (for NGO role users)
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },

    // Volunteer-specific
    vehicleType: { type: String, default: "" },
    isAvailableForPickup: { type: Boolean, default: false },

    // Account state
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;