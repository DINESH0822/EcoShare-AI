const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Claim = require("../models/Claim");
const Operation = require("../models/Operation");
const History = require("../models/History");
const { sendRealtimeNotification } = require("../socket");
const { sendNotification } = require("../services/notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../services/audit");

const claimFood = async (req, res) => {
  try {
    const { foodId, ngoName, ngoId, recipientCount, notes } = req.body;

    if (!req.user) {
      return res.status(401).json(errorResponse("Authentication required to claim a donation.", "AUTH_REQUIRED"));
    }

    if (req.user.role !== "NGO") {
      return res.status(403).json(errorResponse("Only verified NGOs can claim food donations.", "NGO_ROLE_REQUIRED"));
    }

    if (!foodId) {
      return res.status(400).json(errorResponse("Food donation ID is required.", "INVALID_FOOD_ID"));
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json(errorResponse("Food donation not found", "NOT_FOUND"));
    }

    if (["Claimed", "claimed", "completed", "delivered", "cancelled"].includes(food.status)) {
      return res.status(400).json(errorResponse("Food has already been claimed", "ALREADY_CLAIMED"));
    }

    if (food.expiryTime && new Date(food.expiryTime) < new Date()) {
      return res.status(400).json(errorResponse("Cannot claim expired food donation", "FOOD_EXPIRED"));
    }

    const existingClaim = await Claim.findOne({ foodId: food._id, status: { $in: ["requested", "approved", "completed"] } }).lean();
    if (existingClaim) {
      return res.status(409).json(errorResponse("This donation has already been claimed by another NGO.", "CLAIM_ALREADY_EXISTS"));
    }

    let resolvedNgo = null;
    if (ngoId) {
      resolvedNgo = await NGO.findById(ngoId);
    } else if (ngoName) {
      resolvedNgo = await NGO.findOne({ ngoName });
    }

    if (!resolvedNgo && req.user) {
      resolvedNgo = await NGO.findOne({ userId: req.user._id }) || await NGO.findOne({ user: req.user._id }) || await NGO.findById(req.user.ngoId).catch(() => null);
    }

    if (!resolvedNgo) {
      return res.status(403).json(errorResponse("Your NGO profile is not linked to this account.", "NGO_PROFILE_REQUIRED"));
    }

    const isApproved = resolvedNgo.status === "approved" || resolvedNgo.verificationStatus === "verified" || resolvedNgo.verificationStatus === "VERIFIED";
    if (!isApproved) {
      return res.status(403).json(errorResponse("Only verified partner NGOs can claim food donations. Verification pending.", "NGO_NOT_VERIFIED"));
    }

    const category = food.foodCategory || food.category || "cooked_meals";
    const accepted = Array.isArray(resolvedNgo.foodCategoriesAccepted) ? resolvedNgo.foodCategoriesAccepted : ["cooked_meals", "mixed"];
    if (!accepted.includes(category) && !accepted.includes("mixed")) {
      return res.status(400).json(errorResponse(`This NGO does not accept ${category}.`, "CATEGORY_NOT_ACCEPTED"));
    }

    const requiredStorage = Boolean(food.requiresRefrigeration || food.storageCondition === "refrigerated");
    if (requiredStorage && !resolvedNgo.hasRefrigeration) {
      return res.status(400).json(errorResponse("This NGO cannot handle the required storage condition for this donation.", "STORAGE_INCOMPATIBLE"));
    }

    const claimingNgoName = resolvedNgo.ngoName;
    const claimingNgoId = resolvedNgo._id;

    const claim = await Claim.create({
      foodId: food._id,
      donationTraceId: food.traceId,
      ngoId: claimingNgoId,
      ngoName: claimingNgoName,
      claimedByUserId: req.user._id,
      claimedByName: req.user.name,
      status: "approved",
      matchScore: food.matchScore || 0,
      estimatedDistance: 0,
      estimatedDuration: 0,
      operationId: null
    });

    const operation = await Operation.create({
      foodId: food._id,
      donationTraceId: food.traceId,
      donorName: food.donorName,
      donorPhone: food.phone,
      pickupAddress: food.address,
      pickupLat: food.latitude,
      pickupLng: food.longitude,
      ngoId: claimingNgoId,
      ngoName: claimingNgoName,
      deliveryAddress: resolvedNgo.address || food.address,
      deliveryLat: resolvedNgo.latitude || food.latitude,
      deliveryLng: resolvedNgo.longitude || food.longitude,
      foodName: food.foodName,
      quantity: food.quantity,
      expiryTime: food.expiryTime,
      priority: food.priority || "medium",
      isEmergency: Boolean(food.isEmergency),
      status: "claimed",
      timeline: [
        {
          status: "claimed",
          timestamp: new Date(),
          actor: req.user._id,
          actorName: req.user.name,
          note: `Donation claimed by ${claimingNgoName}`
        }
      ]
    });

    claim.operationId = operation._id;
    await claim.save();

    food.status = "Claimed";
    food.claimedBy = claimingNgoName;
    food.claimedByNgoId = claimingNgoId;
    food.claimedAt = new Date();
    food.statusHistory.push({
      status: "claimed",
      changedBy: req.user._id,
      note: `Claimed by NGO '${claimingNgoName}'`
    });
    await food.save();

    await History.create({
      foodId: food._id,
      action: "claimed",
      details: `Food claimed by NGO '${claimingNgoName}'. Rescue operation #${operation._id} initiated.`,
      performedBy: req.user._id,
      performedByName: claimingNgoName,
      performedByRole: "NGO"
    });

    await logAudit({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: "DONATION_CLAIMED",
      entityType: "Food",
      entityId: food._id,
      details: { claimId: claim._id, operationId: operation._id }
    });

    try {
      await sendRealtimeNotification({
        recipientRole: "Donor",
        title: "Your donation has been claimed! 🎉",
        message: `NGO '${claimingNgoName}' has claimed your donation of ${food.foodName}. Pickup operation initiated!`,
        type: "claim_approved"
      });

      await sendRealtimeNotification({
        recipientRole: "NGO",
        title: "Donation claim confirmed",
        message: `Your claim for ${food.foodName} has been confirmed. Pickup operation has been created.`,
        type: "claim_approved"
      });

      if (food.donor || food.donorId) {
        await sendNotification({
          recipient: food.donor || food.donorId,
          type: "claim_approved",
          title: "Donation Claimed",
          message: `${claimingNgoName} has claimed your ${food.foodName} donation.`,
          foodId: food._id,
          operationId: operation._id,
          claimId: claim._id
        });
      }
    } catch (sockErr) {}

    return res.status(200).json(successResponse({
      food,
      claim,
      operation
    }, "Food donation claimed successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "CLAIM_FOOD_FAILED"));
  }
};

// Get claims
const getClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("foodId")
      .populate("ngoId")
      .sort({ createdAt: -1 });

    return res.status(200).json(successResponse(claims));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_CLAIMS_FAILED"));
  }
};

module.exports = {
  claimFood,
  getClaims
};