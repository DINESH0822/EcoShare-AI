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

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json(errorResponse("Food donation not found", "NOT_FOUND"));
    }

    if (food.status === "Claimed" || food.lifecycleState === "completed") {
      return res.status(400).json(errorResponse("Food has already been claimed", "ALREADY_CLAIMED"));
    }

    // Expiry check
    if (food.expiryTime && new Date(food.expiryTime) < new Date()) {
      return res.status(400).json(errorResponse("Cannot claim expired food donation", "FOOD_EXPIRED"));
    }

    let resolvedNgo = null;
    if (ngoId) {
      resolvedNgo = await NGO.findById(ngoId);
    } else if (ngoName) {
      resolvedNgo = await NGO.findOne({ ngoName });
    }

    // Check if user is associated with an NGO
    if (!resolvedNgo && req.user && req.user.ngo) {
      resolvedNgo = await NGO.findById(req.user.ngo);
    }

    // NGO Verification Status Guard
    if (resolvedNgo) {
      const isApproved = resolvedNgo.status === "approved" || resolvedNgo.verificationStatus === "verified";
      if (!isApproved) {
        return res.status(403).json(errorResponse("Only verified partner NGOs can claim food donations. Verification pending.", "NGO_NOT_VERIFIED"));
      }
    }

    const claimingNgoName = resolvedNgo ? resolvedNgo.ngoName : (ngoName || "Partner NGO");
    const claimingNgoId = resolvedNgo ? resolvedNgo._id : null;

    // 1. Create Claim Record
    const claim = await Claim.create({
      foodId: food._id,
      ngoId: claimingNgoId,
      ngoName: claimingNgoName,
      claimedBy: req.user ? req.user._id : null,
      status: "approved",
      requestedAt: new Date(),
      approvedAt: new Date(),
      notes: notes || `Claimed by ${claimingNgoName}`
    });

    // 2. Create Operation Record for Pickup Pipeline
    const operation = await Operation.create({
      foodId: food._id,
      ngoId: claimingNgoId,
      status: "claimed",
      assignedNgoName: claimingNgoName,
      timeline: [
        {
          status: "claimed",
          timestamp: new Date(),
          actor: req.user ? req.user._id : null,
          actorRole: req.user ? req.user.role : "NGO",
          note: `Donation claimed by ${claimingNgoName}`
        }
      ]
    });

    claim.operationId = operation._id;
    await claim.save();

    // 3. Update Food record status
    food.status = "Claimed";
    food.lifecycleState = "claimed";
    food.claimedBy = claimingNgoName;
    food.claimedByNgoId = claimingNgoId;
    food.statusHistory.push({
      status: "claimed",
      changedBy: req.user ? req.user._id : null,
      note: `Claimed by NGO '${claimingNgoName}'`
    });
    await food.save();

    // 4. Log History
    await History.create({
      foodId: food._id,
      action: "claimed",
      details: `Food claimed by NGO '${claimingNgoName}'. Rescue operation #${operation._id} initiated.`,
      performedBy: req.user ? req.user._id : null,
      performedByName: claimingNgoName
    });

    // 5. Audit Log
    await logAudit({
      actor: req.user ? req.user._id : null,
      actorName: claimingNgoName,
      actorRole: req.user ? req.user.role : "NGO",
      action: "DONATION_CLAIMED",
      entityType: "Food",
      entityId: food._id,
      details: { claimId: claim._id, operationId: operation._id }
    });

    // 6. Realtime Notifications
    try {
      await sendRealtimeNotification({
        recipientRole: "Donor",
        title: "Your donation has been claimed! 🎉",
        message: `NGO '${claimingNgoName}' has claimed your donation of ${food.foodName}. Pickup operation initiated!`,
        type: "claimed"
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