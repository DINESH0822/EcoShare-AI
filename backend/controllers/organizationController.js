const crypto = require("crypto");
const NGO = require("../models/NGO");
const User = require("../models/User");
const Partnership = require("../models/Partnership");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../services/audit");

const registerOrganization = async (req, res) => {
  try {
    const {
      organizationName,
      organizationType,
      description,
      contactPerson,
      phone,
      email,
      website,
      address,
      city,
      state,
      pincode,
      country,
      latitude,
      longitude,
      capacity,
      pickupRadius,
      foodCategoriesAccepted,
      refrigerationAvailable,
      storageCapabilities,
      registrationNumber,
      operatingHours
    } = req.body;

    if (!organizationName || !address || !latitude || !longitude) {
      return res.status(400).json(errorResponse("Organization name, address, and coordinates are required.", "INVALID_INPUT"));
    }

    const userId = req.user ? req.user._id : null;

    const ngo = await NGO.create({
      ngoName: organizationName,
      organizationType: organizationType || "ngo",
      description: description || "",
      contactPerson: contactPerson || (req.user ? req.user.name : "Representative"),
      phone: phone || "9820198201",
      email: email || (req.user ? req.user.email : "contact@org.org"),
      website: website || "",
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      country: country || "India",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      capacity: parseInt(capacity) || 100,
      dailyCapacity: parseInt(capacity) || 100,
      pickupRadius: parseInt(pickupRadius) || 10,
      foodCategoriesAccepted: Array.isArray(foodCategoriesAccepted) ? foodCategoriesAccepted : ["cooked_meals"],
      hasRefrigeration: Boolean(refrigerationAvailable),
      storageCapabilities: Array.isArray(storageCapabilities) ? storageCapabilities : [],
      registrationNumber: registrationNumber || "",
      operatingHours: operatingHours || {},
      status: "pending",
      verificationStatus: "PENDING_REVIEW",
      source: "self_registered",
      userId,
      user: userId
    });

    if (userId) {
      await User.findByIdAndUpdate(userId, { ngo: ngo._id, role: "NGO" });
    }

    await logAudit({
      actor: userId,
      actorName: organizationName,
      actorRole: "NGO",
      action: "ORGANIZATION_REGISTERED",
      entityType: "NGO",
      entityId: ngo._id,
      details: { status: "PENDING_REVIEW", city }
    });

    return res.status(201).json(successResponse(ngo, "Organization registered and submitted for PENDING_REVIEW audit."));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "ORG_REGISTRATION_FAILED"));
  }
};

const createPartnershipInvite = async (req, res) => {
  try {
    const { ngoName, contactEmail } = req.body;
    if (!contactEmail) {
      return res.status(400).json(errorResponse("Contact email required for invitation", "INVALID_INPUT"));
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 86400000); // 7 days

    const partnership = await Partnership.create({
      ngoName: ngoName || "Partner Organization",
      contactEmail,
      type: "INVITATION",
      status: "PENDING",
      token,
      expiresAt,
      invitedBy: req.user ? req.user._id : null
    });

    return res.status(201).json(successResponse({
      partnership,
      inviteUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/organizations/accept-invite?token=${token}`
    }, "Partnership invitation generated with secure token"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "INVITE_FAILED"));
  }
};

module.exports = {
  registerOrganization,
  createPartnershipInvite
};
