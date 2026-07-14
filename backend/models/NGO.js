const mongoose = require("mongoose");

const ngoSchema = mongoose.Schema(
  {
    ngoName: {
      type: String,
      required: true
    },

    contactPerson: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: false
    },

    address: {
      type: String,
      required: true
    },

    // City parsed from GPS / Places Autocomplete
    city: {
      type: String,
      default: ""
    },

    // State parsed from GPS / Places Autocomplete
    state: {
      type: String,
      default: ""
    },

    // Pincode parsed from GPS / Places Autocomplete
    pincode: {
      type: String,
      default: ""
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    capacity: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("NGO", ngoSchema);