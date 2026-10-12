const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "donation_created",
  "donation_updated",
  "donation_expired",
  "match_found",
  "claim_requested",
  "claim_approved",
  "claim_rejected",
  "claimed",
  "pickup_scheduled",
  "pickup_started",
  "pickup_completed",
  "donation_delivered",
  "ngo_registered",
  "ngo_verified",
  "ngo_rejected",
  "emergency_rescue",
  "emergency_food",
  "new_donation",
  "no_match_found",
  "volunteer_assigned",
  "info",
  "warning",
  "system"
];

const notificationSchema = mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ["Admin", "Donor", "NGO", "Volunteer", "All"],
      default: "All"
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "info"
    },

    // Link to relevant entity
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },

    // Read tracking
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },

    // Delivery channels (for future use)
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      sms: { type: Boolean, default: false }
    },

    // Demo data
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
