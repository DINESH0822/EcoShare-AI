const mongoose = require("mongoose");

const partnershipSchema = mongoose.Schema(
  {
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },
    ngoName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    type: {
      type: String,
      enum: ["INVITATION", "REQUEST"],
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "EXPIRED"],
      default: "PENDING"
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partnership", partnershipSchema);
