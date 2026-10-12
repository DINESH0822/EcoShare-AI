const mongoose = require("mongoose");

// Donation lifecycle states — explicit state machine
const DONATION_STATUSES = [
  "Available",
  "Claimed",
  "Expired",
  "draft",
  "published",
  "ai_matching",
  "match_found",
  "claim_requested",
  "claimed",
  "pickup_scheduled",
  "pickup_in_progress",
  "collected",
  "delivered",
  "completed",
  "expired",
  "cancelled",
  "rejected",
  "failed_pickup",
  "no_match"
];

const PRIORITY_LEVELS = ["low", "medium", "high", "urgent", "critical"];

const FOOD_CATEGORIES = [
  "cooked_meals",
  "raw_vegetables",
  "raw_fruits",
  "dairy",
  "bakery",
  "grains_pulses",
  "packaged_food",
  "beverages",
  "snacks",
  "meat_seafood",
  "mixed",
  "other"
];

const DONOR_TYPES = [
  "Restaurant",
  "Hotel",
  "Catering Service",
  "Supermarket",
  "Bakery",
  "Corporate Cafeteria",
  "Event Organizer",
  "Individual",
  "Food Manufacturer",
  "Other Food Business"
];

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: DONATION_STATUSES, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  changedByName: { type: String, default: "System" },
  note: { type: String }
}, { _id: false });

const foodSchema = mongoose.Schema(
  {
    // Traceability — unique human-readable ID
    traceId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },

    // Core food info
    foodName: { type: String, required: true, trim: true },
    foodCategory: {
      type: String,
      enum: FOOD_CATEGORIES,
      default: "cooked_meals"
    },
    category: {
      type: String,
      enum: FOOD_CATEGORIES,
      default: "cooked_meals"
    },
    quantity: { type: Number, required: true, min: 1 },
    quantityUnit: { type: String, default: "meals" },
    description: { type: String, default: "" },
    notes: { type: String, default: "" },

    // Donor info
    donorName: { type: String, required: true },
    donorType: { type: String, enum: DONOR_TYPES, default: "Individual" },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Contact
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    phoneVerificationTime: { type: Date },
    firebaseUid: { type: String },

    // Location
    address: { type: String },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    location: { type: String }, // legacy field

    // Food safety fields
    preparedAt: { type: Date },
    expiryTime: { type: Date, required: true },
    pickupDeadline: { type: Date },
    pickupWindowStart: { type: Date },
    pickupWindowEnd: { type: Date },
    storageTemperature: { type: String, default: "room_temperature" },
    storageCondition: { type: String, default: "ambient" },
    requiresRefrigeration: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: true },
    temperatureChecked: { type: Boolean, default: false },
    allergenFlags: [{ type: String }],
    allergens: [{ type: String }],
    packagingType: {
      type: String,
      enum: ["sealed", "covered", "open", "original_packaging"],
      default: "covered"
    },
    allergens: [{ type: String }],
    foodSource: { type: String, default: "" },
    foodSafetyNotes: { type: String, default: "" },
    safetyChecklistCompleted: { type: Boolean, default: false },

    // Lifecycle status
    status: {
      type: String,
      enum: DONATION_STATUSES,
      default: "published"
    },
    priority: {
      type: String,
      enum: PRIORITY_LEVELS,
      default: "medium"
    },
    priorityScore: { type: Number, default: 0 },
    priorityReason: { type: String, default: "" },
    lifecycleState: { type: String, default: "published" },

    // Status audit trail
    statusHistory: [statusHistorySchema],

    // Claim/match tracking
    claimedBy: { type: String, default: "" },
    claimedByNgoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },
    claimedAt: { type: Date },

    // AI matching
    matchScore: { type: Number },
    matchReasons: [{ type: String }],
    matchWarnings: [{ type: String }],

    // Emergency mode
    isEmergency: { type: Boolean, default: false },

    // Demo data marker
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Pre-save: auto-assign traceId if not set
foodSchema.pre("save", async function () {
  if (!this.traceId) {
    const count = await mongoose.model("Food").countDocuments();
    const padded = String(count + 1).padStart(6, "0");
    const year = new Date().getFullYear();
    this.traceId = `ES-DON-${year}-${padded}`;
  }
});

// Computed: is donation expired based on expiryTime
foodSchema.virtual("isExpired").get(function () {
  return this.expiryTime && new Date() > this.expiryTime;
});

// Computed: minutes remaining until expiry
foodSchema.virtual("minutesUntilExpiry").get(function () {
  if (!this.expiryTime) return null;
  return Math.round((new Date(this.expiryTime) - new Date()) / 60000);
});

foodSchema.set("toJSON", { virtuals: true });
foodSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Food", foodSchema);
module.exports.DONATION_STATUSES = DONATION_STATUSES;
module.exports.PRIORITY_LEVELS = PRIORITY_LEVELS;
module.exports.FOOD_CATEGORIES = FOOD_CATEGORIES;
module.exports.DONOR_TYPES = DONOR_TYPES;