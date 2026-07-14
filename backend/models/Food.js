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
      required: false
    },

    phone: {
      type: String,
      required: true
    },

    phoneVerified: {
      type: Boolean,
      default: false
    },

    phoneVerificationTime: {
      type: Date
    },

    firebaseUid: {
      type: String
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    pincode: {
      type: String,
      required: true
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
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