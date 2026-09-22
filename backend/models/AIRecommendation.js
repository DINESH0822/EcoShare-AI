const mongoose = require("mongoose");

const aiRecommendationSchema = mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true
    },
    recommendedNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NGO",
      required: true
    },
    ngoName: {
      type: String,
      required: true
    },
    distance: {
      type: Number,
      required: true
    },
    capacityAvailable: {
      type: Number,
      required: true
    },
    pickupETA: {
      type: Number,
      required: true
    },
    confidenceScore: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AIRecommendation", aiRecommendationSchema);
