const mongoose = require("mongoose");

const CLAIM_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "cancelled",
  "completed"
];

const claimSchema = mongoose.Schema(
  {
    // Donation reference
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    donationTraceId: { type: String },

    // NGO claiming
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true
    },
    ngoName: { type: String, required: true },

    // User who submitted the claim
    claimedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    claimedByName: { type: String },

    // Claim details
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: "requested"
    },

    // AI match data at time of claim
    matchScore: { type: Number },
    estimatedDistance: { type: Number },
    estimatedDuration: { type: Number },

    // Admin/donor decision
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },

    // Operation created from this claim
    operationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operation"
    },

    // Demo data
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Claim", claimSchema);
module.exports.CLAIM_STATUSES = CLAIM_STATUSES;
