const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const NGO = require("../models/NGO");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const VALID_NGO_CATEGORIES = NGO.FOOD_CATEGORIES || [
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

const VALID_ORGANIZATION_TYPES = NGO.ORGANIZATION_TYPES || [
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

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "mysecretkey123", { expiresIn: "30d" });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || "",
  city: user.city || "",
  state: user.state || "",
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

const sanitizeNgoCategories = (categories = []) => {
  if (!Array.isArray(categories)) return ["cooked_meals", "mixed"];

  const normalized = categories
    .map((category) => String(category).trim())
    .filter((category) => category && VALID_NGO_CATEGORIES.includes(category));

  return normalized.length ? [...new Set(normalized)] : ["cooked_meals", "mixed"];
};

const sanitizeOrganizationType = (value) => {
  const normalized = String(value || "ngo").trim().toLowerCase();
  return VALID_ORGANIZATION_TYPES.includes(normalized) ? normalized : "ngo";
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
};

const registerDonor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(errorResponse("Name, email and password are required.", "INVALID_INPUT"));
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json(errorResponse(passwordError, "INVALID_PASSWORD"));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json(errorResponse("A user with this email already exists.", "USER_EXISTS"));
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json(errorResponse("A valid 10-digit mobile number is required.", "INVALID_PHONE"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role: "Donor",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : undefined,
      phoneVerified: false,
      emailVerified: false,
      isActive: true
    });

    const token = generateToken(user._id);
    return res.status(201).json(successResponse({
      user: sanitizeUser(user),
      token
    }, "Donor account created successfully."));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message || "Donor registration failed.", "DONOR_REGISTER_FAILED"));
  }
};

const loginDonor = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    if (!identifier || !password) {
      return res.status(400).json(errorResponse("Email/phone and password are required.", "INVALID_INPUT"));
    }

    const query = email
      ? { email: String(email).trim().toLowerCase() }
      : { phone: normalizePhone(phone) };

    const user = await User.findOne(query);
    if (!user || user.role !== "Donor") {
      return res.status(401).json(errorResponse("Invalid donor credentials.", "INVALID_CREDENTIALS"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(errorResponse("Invalid donor credentials.", "INVALID_CREDENTIALS"));
    }

    const token = generateToken(user._id);
    return res.status(200).json(successResponse({
      user: sanitizeUser(user),
      token
    }, "Donor login successful."));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message || "Donor login failed.", "DONOR_LOGIN_FAILED"));
  }
};

const registerNGO = async (req, res) => {
  try {
    const {
      ngoName,
      registrationNumber,
      contactPerson,
      email,
      phone,
      password,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      organizationType,
      foodCategoriesAccepted,
      categoriesAccepted,
      dailyCapacity,
      operatingHours,
      hasRefrigeration,
      refrigerationAvailable,
      emergencyPickupAvailable,
      vegetarianOnly
    } = req.body;

    const normalizedLatitude = latitude !== undefined && latitude !== null ? Number(latitude) : 0;
    const normalizedLongitude = longitude !== undefined && longitude !== null ? Number(longitude) : 0;
    const normalizedOrganizationType = sanitizeOrganizationType(organizationType);
    const normalizedCategories = sanitizeNgoCategories(foodCategoriesAccepted || categoriesAccepted);
    const hasColdStorage = Boolean(hasRefrigeration || refrigerationAvailable);
    const acceptsEmergencyPickup = Boolean(emergencyPickupAvailable);
    const isVegetarianOnly = Boolean(vegetarianOnly);

    if (!ngoName || !contactPerson || !email || !password || !phone) {
      return res.status(400).json(errorResponse("Organization name, contact person, email, phone and password are required.", "INVALID_INPUT"));
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json(errorResponse(passwordError, "INVALID_PASSWORD"));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json(errorResponse("A user with this email already exists.", "USER_EXISTS"));
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json(errorResponse("A valid 10-digit mobile number is required.", "INVALID_PHONE"));
    }

    const user = await User.create({
      name: contactPerson.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      phone: cleanPhone,
      role: "NGO",
      address: address || "",
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : undefined,
      isActive: true
    });

    const ngo = await NGO.create({
      ngoName: ngoName.trim(),
      organizationType: normalizedOrganizationType,
      contactPerson: contactPerson.trim(),
      phone: cleanPhone,
      email: normalizedEmail,
      address: address ? address.trim() : (city ? `${city}, India` : "India"),
      city: city ? city.trim() : "",
      state: state ? state.trim() : "",
      pincode: pincode ? pincode.trim() : "",
      latitude: normalizedLatitude,
      longitude: normalizedLongitude,
      dailyCapacity: Number(dailyCapacity || 0),
      capacity: Number(dailyCapacity || 0),
      foodCategoriesAccepted: normalizedCategories,
      hasRefrigeration: hasColdStorage,
      emergencyPickupAvailable: acceptsEmergencyPickup,
      vegetarianOnly: isVegetarianOnly,
      operatingHours: operatingHours || { monday: { open: "08:00", close: "20:00" } },
      registrationNumber: registrationNumber || "",
      verificationStatus: "pending",
      status: "pending",
      userId: user._id,
      user: user._id,
      isActive: true
    });

    await User.findByIdAndUpdate(user._id, { ngoId: ngo._id });

    const token = generateToken(user._id);
    return res.status(201).json(successResponse({
      user: sanitizeUser(user),
      ngo: { ...ngo.toObject() },
      token
    }, "NGO account created successfully and is pending verification."));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message || "NGO registration failed.", "NGO_REGISTER_FAILED"));
  }
};

const loginNGO = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = email || phone;

    if (!identifier || !password) {
      return res.status(400).json(errorResponse("Email/phone and password are required.", "INVALID_INPUT"));
    }

    const query = email
      ? { email: String(email).trim().toLowerCase() }
      : { phone: normalizePhone(phone) };

    const user = await User.findOne(query);
    if (!user || user.role !== "NGO") {
      return res.status(401).json(errorResponse("Invalid NGO credentials.", "INVALID_CREDENTIALS"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(errorResponse("Invalid NGO credentials.", "INVALID_CREDENTIALS"));
    }

    const token = generateToken(user._id);
    return res.status(200).json(successResponse({
      user: sanitizeUser(user),
      token
    }, "NGO login successful."));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message || "NGO login failed.", "NGO_LOGIN_FAILED"));
  }
};

module.exports = {
  registerDonor,
  loginDonor,
  registerNGO,
  loginNGO,
  generateToken
};
