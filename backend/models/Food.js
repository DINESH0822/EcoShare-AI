const mongoose = require("mongoose");

const foodSchema = mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true
    },

    donorName: {
      type: String,
      required: true
    },

    donorType: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    expiryTime: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      default: "Available"
    },

    claimedBy: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Food", foodSchema);