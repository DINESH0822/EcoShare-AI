const NGO = require("../models/NGO");
const User = require("../models/User");
const { sendRealtimeNotification } = require("../socket");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../services/audit");

// Create NGO Registration
const createNGO = async (req, res) => {
  try {
    const {
      ngoName,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      capacity,
      categoriesAccepted,
      refrigerationAvailable,
      maxPickupRadiusKm,
      registrationNumber,
      operatingHoursStart,
      operatingHoursEnd
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json(errorResponse("GPS coordinates are required. Please pin the NGO location on map.", "MISSING_COORDINATES"));
    }

    const cleanPhone = String(phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json(errorResponse("A valid 10-digit phone number is required.", "INVALID_PHONE"));
    }

    const userId = req.user ? req.user._id : (req.body.userId || null);

    const ngo = await NGO.create({
      ngoName,
      name: ngoName,
      contactPerson,
      phone: cleanPhone,
      email,
      location: address,
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      capacity: parseInt(capacity) || 100,
      categoriesAccepted: Array.isArray(categoriesAccepted) ? categoriesAccepted : ["cooked_meals", "raw_vegetables"],
      refrigerationAvailable: Boolean(refrigerationAvailable),
      maxPickupRadiusKm: parseInt(maxPickupRadiusKm) || 20,
      registrationNumber: registrationNumber || "",
      operatingHours: {
        open: operatingHoursStart || "08:00",
        close: operatingHoursEnd || "20:00"
      },
      userId,
      user: userId,
      status: "pending",
      verificationStatus: "pending"
    });

    if (userId) {
      await User.findByIdAndUpdate(userId, { ngo: ngo._id, role: "NGO" });
    }

    // Audit Log
    await logAudit({
      actor: userId,
      actorName: ngoName,
      actorRole: "NGO",
      action: "NGO_REGISTERED",
      entityType: "NGO",
      entityId: ngo._id,
      details: { ngoName, city }
    });

    // Alert Admin
    try {
      await sendRealtimeNotification({
        recipientRole: "Admin",
        title: "New NGO Awaiting Approval 🏢",
        message: `NGO '${ngoName}' in ${city || "your region"} registered and is pending document audit.`,
        type: "ngo_registered"
      });
    } catch (sockErr) {}

    return res.status(201).json(ngo);
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "CREATE_NGO_FAILED"));
  }
};

// Get NGOs
const getNGOs = async (req, res) => {
  try {
    const { status, city } = req.query;
    let query = {};
    if (status) {
      query.$or = [{ status }, { verificationStatus: status }];
    }
    if (city) query.city = new RegExp(city, "i");

    const ngos = await NGO.find(query).sort({ rating: -1, createdAt: -1 });
    return res.status(200).json(ngos);
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_NGOS_FAILED"));
  }
};

// Get NGO by ID
const getNGOById = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id).populate("user", "name email role");
    if (!ngo) {
      return res.status(404).json(errorResponse("NGO not found", "NOT_FOUND"));
    }
    return res.status(200).json(successResponse(ngo));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_NGO_FAILED"));
  }
};

// Delete NGO
const deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndDelete(req.params.id);
    if (!ngo) {
      return res.status(404).json(errorResponse("NGO not found", "NOT_FOUND"));
    }
    return res.status(200).json({ message: "NGO deleted successfully" });
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "DELETE_NGO_FAILED"));
  }
};

// Admin Approve NGO
const approveNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json(errorResponse("NGO not found", "NOT_FOUND"));
    }

    ngo.status = "approved";
    ngo.verificationStatus = "verified";
    ngo.verifiedAt = new Date();
    await ngo.save();

    await logAudit({
      actor: req.user ? req.user._id : null,
      actorName: req.user ? req.user.name : "Admin",
      actorRole: "Admin",
      action: "NGO_VERIFIED",
      entityType: "NGO",
      entityId: ngo._id,
      details: { ngoName: ngo.ngoName }
    });

    try {
      if (ngo.userId || ngo.user) {
        await sendRealtimeNotification({
          recipientId: ngo.userId || ngo.user,
          title: "NGO Verification Approved! 🎉",
          message: `Your NGO profile '${ngo.ngoName}' has been verified. You can now claim food donations.`,
          type: "info"
        });
      }
    } catch (e) {}

    return res.status(200).json(ngo);
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "APPROVE_NGO_FAILED"));
  }
};

// Admin Reject NGO
const rejectNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json(errorResponse("NGO not found", "NOT_FOUND"));
    }

    ngo.status = "rejected";
    ngo.verificationStatus = "rejected";
    await ngo.save();

    await logAudit({
      actor: req.user ? req.user._id : null,
      actorName: req.user ? req.user.name : "Admin",
      actorRole: "Admin",
      action: "NGO_REJECTED",
      entityType: "NGO",
      entityId: ngo._id
    });

    return res.status(200).json(ngo);
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "REJECT_NGO_FAILED"));
  }
};

module.exports = {
  createNGO,
  getNGOs,
  getNGOById,
  deleteNGO,
  approveNGO,
  rejectNGO
};