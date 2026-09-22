const mongoose = require("mongoose");

const notificationPreferenceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    whatsApp: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    notifyOnNewDonation: { type: Boolean, default: true },
    notifyOnMatch: { type: Boolean, default: true },
    notifyOnClaim: { type: Boolean, default: true },
    notifyOnPickup: { type: Boolean, default: true },
    notifyOnDelivery: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("NotificationPreference", notificationPreferenceSchema);
