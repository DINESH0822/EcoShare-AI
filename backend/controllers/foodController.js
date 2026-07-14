const Food = require("../models/Food");

// India geographic bounding box (approximate)
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.5
};

// Create Food Donation
const createFood = async (req, res) => {
  try {
    const {
      foodName,
      quantity,
      donorName,
      donorType,
      expiryTime,
      phone,
      phoneVerified,
      phoneVerificationTime,
      firebaseUid,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude
    } = req.body;

    // Security: Prevent unverified phone submissions
    if (!phoneVerified) {
      return res.status(400).json({
        message: "Submission blocked: Phone number is not verified."
      });
    }

    // Validate 10-digit Indian phone number (must start with 6-9)
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        message: "A valid 10-digit Indian mobile number (starting 6–9) is required."
      });
    }

    // Validate GPS coordinates are present
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        message: "Valid GPS coordinates are required. Please select a location on the map."
      });
    }

    // Validate GPS coordinates fall within India's geographic bounds (anti-fake-location)
    if (
      lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat ||
      lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng
    ) {
      return res.status(400).json({
        message: "Location must be within India. Invalid GPS coordinates detected."
      });
    }

    // Validate address is not empty
    if (!address || !address.trim()) {
      return res.status(400).json({
        message: "A valid address is required."
      });
    }

    const food = await Food.create({
      foodName,
      quantity,
      donorName,
      donorType,
      // Keep legacy 'location' field for backward compatibility with older documents
      location: req.body.location || address,
      expiryTime,
      phone: cleanPhone,
      phoneVerified,
      phoneVerificationTime,
      firebaseUid: firebaseUid || "",
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: lat,
      longitude: lng
    });

    res.status(201).json(food);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Food Donations
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();

    res.status(200).json(foods);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Food Donation
const deleteFood = async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFood) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    res.status(200).json({
      message: "Food deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createFood,
  getFoods,
  deleteFood
};