const mongoose = require("mongoose");

const VERIFICATION_STATUSES = [
  "pending", 
  "verified", 
  "suspended", 
  "rejected", 
  "DRAFT", 
  "PENDING_REVIEW", 
  "UNDER_REVIEW", 
  "VERIFIED", 
  "REJECTED", 
  "SUSPENDED"
];

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

const ORGANIZATION_TYPES = [
  "ngo",
  "food_bank",
  "shelter",
  "orphanage",
  "old_age_home",
  "community_kitchen",
  "hospital",
  "school",
  "religious_organization",
  "corporate_csr",
  "government",
  "other"
];

const operatingHoursSchema = new mongoose.Schema({
  open: { type: String, default: "08:00" },
  close: { type: String, default: "20:00" },
  open24h: { type: Boolean, default: false }
}, { _id: false });

const ngoSchema = mongoose.Schema(
  {
    // Core identity
    ngoName: { type: String, required: true, trim: true },
    organizationType: {
      type: String,
      enum: ORGANIZATION_TYPES,
      default: "ngo"
    },
    description: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    fssaiInfo: { type: String, default: "" },
    website: { type: String, default: "" },

    // Contact
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    alternatePhone: { type: String, default: "" },

    // Location
    address: { type: String, required: true },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    district: { type: String, default: "" },
    country: { type: String, default: "India" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    location: { type: String }, // legacy

    // Operational capabilities
    dailyCapacity: { type: Number, default: 0 }, // meals/day
    capacity: { type: Number, default: 0 }, // alias for dailyCapacity
    pickupRadius: { type: Number, default: 10 }, // km
    emergencyPickupAvailable: { type: Boolean, default: false },
    hasRefrigeration: { type: Boolean, default: false },
    storageCapabilities: [{ type: String }],

    // Food preferences
    foodCategoriesAccepted: {
      type: [String],
      enum: FOOD_CATEGORIES,
      default: ["cooked_meals", "mixed"]
    },
    vegetarianOnly: { type: Boolean, default: false },

    // Operating hours
    operatingHours: {
      monday: { type: operatingHoursSchema, default: () => ({}) },
      tuesday: { type: operatingHoursSchema, default: () => ({}) },
      wednesday: { type: operatingHoursSchema, default: () => ({}) },
      thursday: { type: operatingHoursSchema, default: () => ({}) },
      friday: { type: operatingHoursSchema, default: () => ({}) },
      saturday: { type: operatingHoursSchema, default: () => ({}) },
      sunday: { type: operatingHoursSchema, default: () => ({}) }
    },

    // Verification
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "pending"
    },
    // Legacy field — maps to verificationStatus for backward compat
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "verified", "suspended"],
      default: "pending"
    },
    verificationDocuments: [{ type: String }], // URLs
    verificationNotes: { type: String, default: "" },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Source tracking (for public directory import)
    source: {
      type: String,
      enum: ["self_registered", "public_listing", "admin_imported", "partner_invited"],
      default: "self_registered"
    },
    sourceUrl: { type: String, default: "" },

    // Ownership
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Performance metrics
    totalClaimsCompleted: { type: Number, default: 0 },
    totalMealsRescued: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 100 }, // 0-100
    averagePickupTime: { type: Number }, // minutes

    // Active state
    isActive: { type: Boolean, default: true },
    currentWorkload: { type: Number, default: 0 }, // meals currently in pipeline

    // Demo data
    isDemoData: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Virtual: is currently accepting donations
ngoSchema.virtual("isCurrentlyOpen").get(function () {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const dayName = days[now.getDay()];
  const hours = this.operatingHours?.[dayName];
  if (!hours) return true; // default open
  if (hours.open24h) return true;
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  return timeStr >= hours.open && timeStr <= hours.close;
});

// Virtual: is EcoShare verified partner
ngoSchema.virtual("isVerifiedPartner").get(function () {
  return this.verificationStatus === "verified" || this.status === "approved";
});

ngoSchema.set("toJSON", { virtuals: true });
ngoSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("NGO", ngoSchema);
module.exports.VERIFICATION_STATUSES = VERIFICATION_STATUSES;
module.exports.FOOD_CATEGORIES = FOOD_CATEGORIES;
module.exports.ORGANIZATION_TYPES = ORGANIZATION_TYPES;