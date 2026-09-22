const mongoose = require("mongoose");

const matchFeedbackSchema = mongoose.Schema(
  {
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", required: true },
    matchScore: { type: Number, required: true },
    features: {
      distanceKm: Number,
      capacityFit: Number,
      urgencyScore: Number,
      categoryMatch: Boolean,
      refrigerationMatch: Boolean
    },
    decision: {
      type: String,
      enum: ["SUGGESTED", "ACCEPTED", "REJECTED", "EXPIRED", "COMPLETED", "FAILED"],
      default: "SUGGESTED"
    },
    outcomeReason: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MatchFeedback", matchFeedbackSchema);
