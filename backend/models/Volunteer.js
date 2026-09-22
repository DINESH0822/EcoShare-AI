const mongoose = require("mongoose");

const VEHICLE_TYPES = [
  "motorcycle",
  "bicycle",
  "car",
  "van",
  "truck",
  "auto_rickshaw",
  "on_foot",
  "other"
];

const VOLUNTEER_STATUSES = ["active", "inactive", "suspended"];

const volunteerSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },

    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      default: "motorcycle"
    },
    vehicleNumber: { type: String, default: "" },

    // Availability
    isAvailable: { type: Boolean, default: false },
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: false }
    },

    // Current location (only stored with consent)
    currentLat: { type: Number },
    currentLng: { type: Number },
    locationUpdatedAt: { type: Date },

    // Service area
    serviceRadius: { type: Number, default: 15 }, // km
    serviceCity: { type: String, default: "" },
    serviceState: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: VOLUNTEER_STATUSES,
      default: "active"
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },

    // Current assignment
    currentOperationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operation"
    },

    // Performance
    totalPickupsCompleted: { type: Number, default: 0 },
    totalMealsDelivered: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 100 },

    // Demo data
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
