const mongoose = require("mongoose");

const historySchema = mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    action: {
      type: String,
      enum: [
        "created",
        "published",
        "ai_matching_started",
        "ai_recommended",
        "match_found",
        "no_match_found",
        "claim_requested",
        "claimed",
        "pickup_scheduled",
        "pickup_started",
        "picked_up",
        "in_transit",
        "delivered",
        "completed",
        "expired",
        "cancelled",
        "failed_pickup",
        "status_changed",
        "emergency_escalated",
        "safety_check_passed",
        "volunteer_assigned"
      ],
      required: true
    },
    details: { type: String },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    performedByName: { type: String, default: "System" },
    performedByRole: { type: String, default: "System" },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: true
  }
);

historySchema.index({ foodId: 1, createdAt: 1 });

module.exports = mongoose.model("History", historySchema);
