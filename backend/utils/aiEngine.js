/**
 * EcoShare AI Matching Engine
 *
 * This is an EXPLAINABLE SCORING ENGINE, not a trained ML model.
 * Scores are calculated from measurable operational factors.
 * Every score is fully explainable through reasons[].
 * Architecture is designed so an ML model can replace the scoring layer later.
 */

const NGO = require("../models/NGO");
const Food = require("../models/Food");
const AIRecommendation = require("../models/AIRecommendation");
const { routingProvider, haversineDistance } = require("../services/routing");
const { runMlPrediction } = require("../services/mlService");

// India geographic bounding box
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.6,
  minLng: 68.0,
  maxLng: 97.5
};

/**
 * Calculate priority level for a donation
 * Returns: { priority, reason }
 */
const calculatePriority = (food) => {
  const now = new Date();
  const expiryMs = new Date(food.expiryTime) - now;
  const expiryHours = expiryMs / (1000 * 60 * 60);
  const expiryMins = Math.round(expiryMs / (1000 * 60));

  if (expiryHours <= 0) {
    return { priority: "critical", reason: "Donation has already expired." };
  }
  if (expiryHours <= 1) {
    return {
      priority: "critical",
      reason: `Food expires in approximately ${expiryMins} minutes. Immediate rescue required.`
    };
  }
  if (expiryHours <= 2) {
    return {
      priority: "urgent",
      reason: `Food expires in approximately ${Math.round(expiryHours * 60)} minutes. Urgent pickup needed.`
    };
  }
  if (expiryHours <= 4) {
    return {
      priority: "high",
      reason: `Food expires in approximately ${expiryHours.toFixed(1)} hours. High priority rescue.`
    };
  }
  if (expiryHours <= 12) {
    return {
      priority: "medium",
      reason: `Food expires in approximately ${expiryHours.toFixed(1)} hours.`
    };
  }
  return {
    priority: "low",
    reason: `Food expires in approximately ${expiryHours.toFixed(0)} hours. Standard priority.`
  };
};

/**
 * Check if an NGO is currently accepting food (operating hours)
 */
const isNGOCurrentlyOpen = (ngo) => {
  if (!ngo.operatingHours) return true; // default: assume open
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const dayName = days[now.getDay()];
  const hours = ngo.operatingHours[dayName];
  if (!hours) return true;
  if (hours.open24h) return true;
  const timeStr =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  return timeStr >= hours.open && timeStr <= hours.close;
};

/**
 * Check food category compatibility
 */
const isFoodCompatible = (food, ngo) => {
  if (!ngo.foodCategoriesAccepted?.length) return true; // accepts all
  if (ngo.foodCategoriesAccepted.includes("mixed")) return true;
  if (food.foodCategory && ngo.foodCategoriesAccepted.includes(food.foodCategory)) return true;
  // Default "cooked_meals" is broadly accepted
  if (!food.foodCategory && ngo.foodCategoriesAccepted.includes("cooked_meals")) return true;
  return false;
};

/**
 * Check refrigeration compatibility
 */
const meetsRefrigerationNeeds = (food, ngo) => {
  if (food.requiresRefrigeration && !ngo.hasRefrigeration) return false;
  return true;
};

/**
 * Check if pickup can happen before expiry given estimated travel time
 */
const canPickupBeforeExpiry = (food, estimatedMinutes) => {
  const now = new Date();
  const expiryMs = new Date(food.expiryTime) - now;
  const expiryMins = expiryMs / (1000 * 60);
  // Allow 15 min buffer for handover
  return expiryMins > estimatedMinutes + 15;
};

/**
 * Check if NGO is within pickup radius of food
 */
const isWithinPickupRadius = (ngo, distanceKm) => {
  const radius = ngo.pickupRadius || 15; // default 15km if not set
  return distanceKm <= radius;
};

/**
 * Calculate match score and reasons for a single NGO candidate
 */
const scoreCandidate = async (food, ngo, routeData) => {
  const reasons = [];
  const warnings = [];
  let totalScore = 0;

  const distanceKm = routeData?.distance || haversineDistance(
    food.latitude, food.longitude,
    ngo.latitude, ngo.longitude
  );
  const estimatedMinutes = routeData?.duration || Math.round(distanceKm * 4 + 4);
  const isEstimated = routeData?.isEstimated !== false;

  // ---- Factor 1: Organization Verification (0-20 pts) ----
  const isVerified = ngo.verificationStatus === "verified" || ngo.status === "approved";
  if (isVerified) {
    totalScore += 20;
    reasons.push("Organization is EcoShare verified");
  } else {
    warnings.push("Organization is not yet verified — will not appear in automatic matching");
    return null; // Unverified NGOs excluded from automatic matching
  }

  // ---- Factor 2: Food Category Compatibility (0-15 pts) ----
  const compatible = isFoodCompatible(food, ngo);
  if (compatible) {
    totalScore += 15;
    reasons.push("Food category accepted by this organization");
  } else {
    warnings.push("Food category may not be accepted by this organization");
    totalScore += 0;
  }

  // ---- Factor 3: Refrigeration (0-10 pts) ----
  const refrigOk = meetsRefrigerationNeeds(food, ngo);
  if (refrigOk) {
    totalScore += 10;
    if (food.requiresRefrigeration) {
      reasons.push("Cold storage available");
    }
  } else {
    warnings.push("Food requires refrigeration but organization does not have cold storage");
    // Don't disqualify, but reduce score
    totalScore -= 10;
  }

  // ---- Factor 4: Proximity (0-20 pts) ----
  const proximityScore = Math.max(0, 20 - distanceKm * 1.5);
  totalScore += proximityScore;
  if (distanceKm <= 2) reasons.push(`Very close distance (${distanceKm} km)`);
  else if (distanceKm <= 5) reasons.push(`Nearby (${distanceKm} km)`);
  else reasons.push(`Distance: ${distanceKm} km`);

  // ---- Factor 5: Pickup Radius (0-5 pts) ----
  const withinRadius = isWithinPickupRadius(ngo, distanceKm);
  if (withinRadius) {
    totalScore += 5;
    reasons.push("Within organization's pickup radius");
  } else {
    warnings.push(`Distance (${distanceKm} km) exceeds organization's stated pickup radius (${ngo.pickupRadius || 15} km)`);
  }

  // ---- Factor 6: Capacity (0-15 pts) ----
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const claimedToday = await Food.aggregate([
    {
      $match: {
        claimedByNgoId: ngo._id,
        status: { $in: ["claimed", "pickup_scheduled", "pickup_in_progress", "collected", "delivered", "completed"] },
        updatedAt: { $gte: startOfDay }
      }
    },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } }
  ]);
  const claimedCount = claimedToday.length > 0 ? claimedToday[0].totalQuantity : 0;
  const capacity = ngo.dailyCapacity || ngo.capacity || 0;
  const remainingCapacity = Math.max(0, capacity - claimedCount);

  let capacityScore = 0;
  if (capacity > 0) {
    if (remainingCapacity >= food.quantity) {
      capacityScore = 15;
      reasons.push(`Sufficient capacity (${remainingCapacity} meals available)`);
    } else if (remainingCapacity > 0) {
      capacityScore = Math.round((remainingCapacity / food.quantity) * 15);
      warnings.push(`Limited capacity: ${remainingCapacity} meals available, ${food.quantity} needed`);
    } else {
      warnings.push("Organization may be at capacity today");
    }
  } else {
    // Capacity not set — assume available
    capacityScore = 10;
    reasons.push("Capacity available");
    remainingCapacity = 9999;
  }
  totalScore += capacityScore;

  // ---- Factor 7: Expiry / Urgency timing (0-10 pts) ----
  const canPickup = canPickupBeforeExpiry(food, estimatedMinutes);
  if (canPickup) {
    const expiryMs = new Date(food.expiryTime) - new Date();
    const expiryHours = expiryMs / (1000 * 60 * 60);
    let expiryScore = 0;
    if (expiryHours < 2) expiryScore = 10;
    else if (expiryHours < 4) expiryScore = 8;
    else if (expiryHours < 8) expiryScore = 6;
    else expiryScore = 5;
    totalScore += expiryScore;
    reasons.push("Pickup estimated to complete before expiry");
  } else {
    warnings.push("Estimated travel time may not allow pickup before expiry");
    totalScore -= 5;
  }

  // ---- Factor 8: Operating Hours (0-5 pts) ----
  const isOpen = isNGOCurrentlyOpen(ngo);
  if (isOpen) {
    totalScore += 5;
    reasons.push("Currently within operating hours");
  } else {
    warnings.push("Organization may not be accepting donations at this hour");
  }

  // ---- Factor 9: Emergency Capability (0-5 pts) ----
  const expiryHoursLeft = (new Date(food.expiryTime) - new Date()) / (1000 * 60 * 60);
  if (food.isEmergency || expiryHoursLeft < 2) {
    if (ngo.emergencyPickupAvailable) {
      totalScore += 5;
      reasons.push("Emergency pickup capability available");
    } else {
      warnings.push("Organization does not offer emergency pickup");
    }
  }

  // ---- Factor 10: Historical Reliability (0-5 pts) ----
  const reliability = ngo.reliabilityScore || 100;
  const reliabilityScore = Math.round((reliability / 100) * 5);
  totalScore += reliabilityScore;
  if (reliability >= 90) reasons.push(`High reliability score (${reliability}%)`);

  // Normalize to 0-100
  const normalizedScore = Math.min(99, Math.max(40, totalScore));

  let mlPrediction = null;
  try {
    const mlInput = {
      distance_km: distanceKm,
      quantity: food.quantity,
      remaining_shelf_life_hours: Math.max(0.1, (new Date(food.expiryTime) - new Date()) / (1000 * 60 * 60)),
      ngo_capacity: capacity || 100,
      category: food.foodCategory || food.category || "cooked_meals",
      is_emergency: Boolean(food.isEmergency),
      requires_refrigeration: Boolean(food.requiresRefrigeration)
    };
    mlPrediction = await runMlPrediction(mlInput);
    if (mlPrediction && mlPrediction.success && mlPrediction.explanations) {
      reasons.push(...mlPrediction.explanations);
    }
  } catch (mlErr) {
    console.warn("[AIEngine] ML prediction note:", mlErr.message);
  }

  return {
    ngo,
    distance: distanceKm,
    estimatedDuration: estimatedMinutes,
    capacityAvailable: remainingCapacity,
    pickupETA: estimatedMinutes,
    confidenceScore: normalizedScore,
    matchScore: normalizedScore,
    mlPrediction,
    reasons,
    warnings,
    isEstimatedRoute: isEstimated,
    routePolyline: routeData?.polyline || null,
    reason: reasons.join(". ") + (warnings.length ? ` Warnings: ${warnings.join(". ")}` : "")
  };
};

/**
 * Main: Calculate recommendations for a newly created food donation
 * Returns top 3 matches (or null if no eligible NGOs)
 */
const calculateRecommendations = async (food) => {
  try {
    if (!food.latitude || !food.longitude) {
      console.warn("[AIEngine] Food has no coordinates — cannot match");
      return null;
    }

    // Only verified NGOs participate in automatic matching
    const eligibleNGOs = await NGO.find({
      $or: [{ verificationStatus: "verified" }, { status: "approved" }],
      isActive: { $ne: false }
    });

    if (eligibleNGOs.length === 0) {
      console.log("[AIEngine] No verified NGOs available for matching");
      return null;
    }

    const foodCoords = { lat: food.latitude, lng: food.longitude };
    const candidates = [];

    for (const ngo of eligibleNGOs) {
      if (!ngo.latitude || !ngo.longitude) continue;

      // Pre-filter: basic distance check (skip NGOs > 50km away)
      const roughDist = haversineDistance(
        foodCoords.lat, foodCoords.lng,
        ngo.latitude, ngo.longitude
      );
      if (roughDist > 50) continue;

      // Get routing data if available
      let routeData = null;
      try {
        routeData = await routingProvider.getRoute(
          foodCoords.lat, foodCoords.lng,
          ngo.latitude, ngo.longitude
        );
      } catch (routeErr) {
        // Routing failed — use Haversine estimate
        console.warn(`[AIEngine] Routing failed for NGO ${ngo.ngoName}: ${routeErr.message}`);
      }

      const scored = await scoreCandidate(food, ngo, routeData);
      if (scored) candidates.push(scored);
    }

    if (candidates.length === 0) return null;

    // Sort by score desc, then distance asc
    candidates.sort((a, b) =>
      b.confidenceScore - a.confidenceScore || a.distance - b.distance
    );

    const topMatches = candidates.slice(0, 3);
    const bestMatch = topMatches[0];

    // Save best match to AIRecommendation collection
    const rec = await AIRecommendation.create({
      foodId: food._id,
      recommendedNgoId: bestMatch.ngo._id,
      ngoName: bestMatch.ngo.ngoName,
      distance: bestMatch.distance,
      capacityAvailable: bestMatch.capacityAvailable,
      pickupETA: bestMatch.pickupETA,
      confidenceScore: bestMatch.confidenceScore,
      reason: bestMatch.reason,
      status: "pending"
    });

    return {
      ...rec.toObject(),
      reasons: bestMatch.reasons,
      warnings: bestMatch.warnings,
      isEstimatedRoute: bestMatch.isEstimatedRoute,
      allCandidates: topMatches.map((c) => ({
        ngoId: c.ngo._id,
        ngoName: c.ngo.ngoName,
        matchScore: c.confidenceScore,
        distance: c.distance,
        estimatedDuration: c.estimatedDuration,
        reasons: c.reasons,
        warnings: c.warnings
      }))
    };
  } catch (error) {
    console.error("[AIEngine] Recommendation computation error:", error);
    return null;
  }
};

module.exports = {
  calculateRecommendations,
  calculatePriority,
  scoreCandidate,
  isNGOCurrentlyOpen,
  isFoodCompatible,
  haversineDistance
};
