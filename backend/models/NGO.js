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