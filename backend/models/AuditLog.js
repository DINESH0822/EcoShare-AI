const mongoose = require("mongoose");

const auditLogSchema = mongoose.Schema(
  {
    // Who performed the action
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String, default: "System" },
    actorRole: { type: String, default: "System" },

    // What was done
    action: {
      type: String,
      required: true,
      enum: [
        "user_registered",
        "user_login",
        "user_updated",
        "user_suspended",
        "donation_created",
        "donation_updated",
        "donation_status_changed",
        "donation_deleted",
        "donation_expired",
        "claim_requested",
        "claim_approved",
        "claim_rejected",
        "claim_cancelled",
        "operation_created",
        "operation_status_updated",
        "operation_completed",
        "operation_failed",
        "ngo_registered",
        "ngo_verified",
        "ngo_rejected",
        "ngo_suspended",
        "ngo_updated",
        "ngo_deleted",
        "volunteer_registered",
        "volunteer_assigned",
        "volunteer_completed",
        "ai_match_generated",
        "notification_sent",
        "admin_action",
        "system_event"
      ]
    },

    // What entity was affected
    entityType: {
      type: String,
      enum: ["Food", "NGO", "User", "Claim", "Operation", "Volunteer", "Notification", "System"]
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityLabel: { type: String }, // human-readable label e.g. "ES-DON-2026-000001"

    // Result
    result: {
      type: String,
      enum: ["success", "failure", "warning"],
      default: "success"
    },

    // Additional details
    metadata: { type: mongoose.Schema.Types.Mixed },
    note: { type: String },

    // Request context (where appropriate)
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
