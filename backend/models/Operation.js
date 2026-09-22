const mongoose = require("mongoose");

const OPERATION_STATUSES = [
  "matching",
  "matched",
  "claim_requested",
  "claimed",
  "pickup_scheduled",
  "en_route",
  "arrived",
  "collected",
  "delivered",
  "completed",
  "failed",
  "cancelled"
];

const pickupEventSchema = new mongoose.Schema({
  status: { type: String, enum: OPERATION_STATUSES, required: true },
  timestamp: { type: Date, default: Date.now },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorName: { type: String },
  note: { type: String },
  gpsLat: { type: Number },
  gpsLng: { type: Number }
}, { _id: false });

const operationSchema = mongoose.Schema(
  {
    // Reference to food donation
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    donationTraceId: { type: String }, // ES-DON-YYYY-NNNNNN

    // Donor info snapshot
    donorName: { type: String },
    donorPhone: { type: String },
    pickupAddress: { type: String },
    pickupLat: { type: Number },
    pickupLng: { type: Number },

    // Recipient NGO
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO"
    },
    ngoName: { type: String },
    ngoPhone: { type: String },
    deliveryAddress: { type: String },
    deliveryLat: { type: Number },
    deliveryLng: { type: Number },

    // Volunteer / driver
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    volunteerName: { type: String },

    // AI match snapshot
    matchScore: { type: Number },
    estimatedDistance: { type: Number }, // km
    estimatedDuration: { type: Number }, // minutes
    matchReasons: [{ type: String }],

    // Status
    status: {
      type: String,
      enum: OPERATION_STATUSES,
      default: "matching"
    },

    // Timeline
    timeline: [pickupEventSchema],

    // Proof of pickup
    pickupOTP: { type: String },
    pickupOTPVerified: { type: Boolean, default: false },
    pickupPhotoUrl: { type: String },
    pickupTimestamp: { type: Date },
    pickupGpsLat: { type: Number },
    pickupGpsLng: { type: Number },
    deliveryTimestamp: { type: Date },

    // Food info snapshot
    foodName: { type: String },
    quantity: { type: Number },
    expiryTime: { type: Date },
    priority: { type: String, default: "medium" },

    // Emergency operation
    isEmergency: { type: Boolean, default: false },

    // Demo data
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Operation", operationSchema);
module.exports.OPERATION_STATUSES = OPERATION_STATUSES;
