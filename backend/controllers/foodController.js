const Food = require("../models/Food");
const History = require("../models/History");
const AIRecommendation = require("../models/AIRecommendation");
const { calculateRecommendations } = require("../utils/aiEngine");
const { sendRealtimeNotification } = require("../socket");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// India geographic bounding box (approximate)
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.5
};

// Create Food Donation
const normalizeFoodCategory = (value) => {
  const category = String(value || "cooked_meals").trim();
  return (Food.FOOD_CATEGORIES || []).includes(category) ? category : "cooked_meals";
};

const normalizePriority = (value, isEmergency) => {
  const priorityMap = {
    normal: "medium",
    emergency: "urgent",
    low: "low",
    medium: "medium",
    high: "high",
    urgent: "urgent",
    critical: "critical"
  };

  const normalized = String(value || (isEmergency ? "emergency" : "normal")).trim().toLowerCase();
  return priorityMap[normalized] || (isEmergency ? "urgent" : "medium");
};

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
      longitude,
      category,
      foodCategory,
      priority,
      cookedTime,
      storageCondition,
      temperatureChecked,
      allergenFlags,
      isEmergency,
      notes,
      pickupWindowStart,
      pickupWindowEnd
    } = req.body;

    const normalizedCategory = normalizeFoodCategory(category || foodCategory);
    const normalizedPriority = normalizePriority(priority, Boolean(isEmergency));

    // Optional phone validation — if provided and phoneVerified is true, validate clean phone
    let cleanPhone = "";
    if (phone) {
      cleanPhone = String(phone).replace(/\D/g, "");
    }

    // Validate GPS coordinates if provided
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (
        lat < INDIA_BOUNDS.minLat || lat > INDIA_BOUNDS.maxLat ||
        lng < INDIA_BOUNDS.minLng || lng > INDIA_BOUNDS.maxLng
      ) {
        return res.status(400).json(errorResponse("Location must be within India. Invalid GPS coordinates.", "INVALID_LOCATION"));
      }
    }

    // Address validation
    if (!address || !address.trim()) {
      return res.status(400).json(errorResponse("A valid address is required.", "INVALID_ADDRESS"));
    }

    const donorId = req.user ? req.user._id : (req.body.donorId || null);

    // Initial status and priority calculation
    let initialPriority = isEmergency ? "emergency" : "normal";
    let priorityScore = isEmergency ? 100 : 50;

    const food = await Food.create({
      foodName,
      quantity,
      donorName: donorName || (req.user ? req.user.name : "Anonymous Donor"),
      donorType: donorType || "Individual",
      location: address,
      expiryTime,
      phone: cleanPhone,
      phoneVerified: Boolean(phoneVerified),
      phoneVerificationTime,
      firebaseUid: firebaseUid || "",
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: !isNaN(lat) ? lat : 19.076,
      longitude: !isNaN(lng) ? lng : 72.8777,
      donor: donorId,
      donorId,
      foodCategory: normalizedCategory,
      category: normalizedCategory,
      cookedTime: cookedTime ? new Date(cookedTime) : new Date(),
      storageTemperature: storageCondition || "room_temperature",
      temperatureChecked: Boolean(temperatureChecked),
      allergens: Array.isArray(allergenFlags) ? allergenFlags : [],
      isEmergency: Boolean(isEmergency),
      priority: normalizedPriority,
      priorityReason: isEmergency ? "Emergency food rescue requested" : "Standard donation priority",
      priorityScore,
      description: notes || "",
      foodSafetyNotes: notes || "",
      notes: notes || "",
      lifecycleState: "published",
      pickupWindowStart: pickupWindowStart ? new Date(pickupWindowStart) : new Date(),
      pickupWindowEnd: pickupWindowEnd ? new Date(pickupWindowEnd) : (expiryTime ? new Date(expiryTime) : new Date(Date.now() + 6 * 3600000)),
      pickupDeadline: pickupWindowEnd ? new Date(pickupWindowEnd) : (expiryTime ? new Date(expiryTime) : new Date(Date.now() + 6 * 3600000)),
      status: "Available",
      statusHistory: [
        {
          status: "published",
          changedBy: donorId,
          note: "Donation published to EcoShare network"
        }
      ]
    });

    // Run AI Recommendation Engine
    let recommendation = null;
    try {
      recommendation = await calculateRecommendations(food);
    } catch (aiErr) {
      console.error("AI Matching calculation warning:", aiErr.message);
    }

    // Create Timeline History Log
    await History.create({
      foodId: food._id,
      action: "created",
      details: `Food donation '${foodName}' (${quantity} meals) created with status 'published'.`,
      performedBy: donorId,
      performedByName: food.donorName
    });

    if (recommendation) {
      await History.create({
        foodId: food._id,
        action: "ai_recommended",
        details: `AI matched with '${recommendation.ngoName}' (${recommendation.confidenceScore}% match score). Reason: ${recommendation.reason}`,
        performedByName: "EcoShare AI Engine"
      });
    }

    // Trigger Socket.io real-time alert
    try {
      await sendRealtimeNotification({
        recipientRole: "NGO",
        title: isEmergency ? "🚨 EMERGENCY Food Donation Available!" : "New Food Donation Available! 🍱",
        message: `${food.quantity} servings of '${foodName}' in ${food.city || "your area"}. Click to view match & dispatch route.`,
        type: isEmergency ? "emergency_rescue" : "donation_created"
      });
    } catch (sockErr) {}

    return res.status(201).json({
      success: true,
      data: food,
      food,
      recommendation
    });

  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "CREATE_FOOD_FAILED"));
  }
};

// Get All Food Donations
const getFoods = async (req, res) => {
  try {
    const { status, category, isEmergency } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (category || req.query.foodCategory) filter.foodCategory = (category || req.query.foodCategory);
    if (isEmergency !== undefined) filter.isEmergency = isEmergency === "true";

    const foods = await Food.find(filter).sort({ isEmergency: -1, priorityScore: -1, createdAt: -1 }).lean();

    const enrichedFoods = await Promise.all(
      foods.map(async (food) => {
        const recommendation = await AIRecommendation.findOne({ foodId: food._id }).lean();
        const timeline = await History.find({ foodId: food._id }).sort({ createdAt: 1 }).lean();
        return {
          ...food,
          recommendation,
          timeline
        };
      })
    );

    return res.status(200).json(enrichedFoods);
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_FOODS_FAILED"));
  }
};

// Get Food by ID
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate("donor", "name email phone");
    if (!food) {
      return res.status(404).json(errorResponse("Food donation not found", "NOT_FOUND"));
    }

    const recommendation = await AIRecommendation.findOne({ foodId: food._id });
    const timeline = await History.find({ foodId: food._id }).sort({ createdAt: 1 });

    return res.status(200).json(successResponse({
      food,
      recommendation,
      timeline
    }));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_FOOD_FAILED"));
  }
};

// Get Food by Traceability ID
const getFoodByTraceabilityId = async (req, res) => {
  try {
    const food = await Food.findOne({ traceabilityId: req.params.traceabilityId }).populate("donor", "name email");
    if (!food) {
      return res.status(404).json(errorResponse("Traceability record not found", "NOT_FOUND"));
    }

    const timeline = await History.find({ foodId: food._id }).sort({ createdAt: 1 });

    return res.status(200).json(successResponse({
      food,
      timeline
    }));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_TRACE_FAILED"));
  }
};

// Get Ranked AI Matches for Food
const getMatchesForFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json(errorResponse("Food donation not found", "NOT_FOUND"));
    }

    const recommendation = await calculateRecommendations(food);

    return res.status(200).json(successResponse({
      topMatch: recommendation,
      candidates: recommendation ? recommendation.allCandidates : []
    }, "AI recommendations calculated"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "AI_MATCH_FAILED"));
  }
};

// Delete Food Donation
const deleteFood = async (req, res) => {
  try {
    const deletedFood = await Food.findByIdAndDelete(req.params.id);

    if (!deletedFood) {
      return res.status(404).json(errorResponse("Food not found", "NOT_FOUND"));
    }

    await AIRecommendation.deleteMany({ foodId: req.params.id });
    await History.deleteMany({ foodId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Food deleted successfully"
    });
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "DELETE_FOOD_FAILED"));
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  getFoodByTraceabilityId,
  getMatchesForFood,
  deleteFood
};