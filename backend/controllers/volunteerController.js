const Volunteer = require("../models/Volunteer");
const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../services/audit");

const getVolunteers = async (req, res) => {
  try {
    const { status, vehicleType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vehicleType) query.vehicleType = vehicleType;

    const volunteers = await Volunteer.find(query)
      .populate("user", "name email phone role")
      .sort({ rating: -1, completedPickups: -1 });

    return res.status(200).json(successResponse(volunteers, "Volunteers retrieved"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_VOLUNTEERS_FAILED"));
  }
};

const getVolunteerProfile = async (req, res) => {
  try {
    let volunteer = await Volunteer.findOne({ user: req.user._id }).populate("user", "name email phone");
    if (!volunteer) {
      return res.status(404).json(errorResponse("Volunteer profile not found for this user", "NOT_FOUND"));
    }
    return res.status(200).json(successResponse(volunteer));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_VOLUNTEER_PROFILE_FAILED"));
  }
};

const registerVolunteer = async (req, res) => {
  try {
    const { vehicleType, maxServiceRadiusKm, availability, emergencyContact, preferredAreas } = req.body;

    let existing = await Volunteer.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json(errorResponse("Volunteer profile already exists", "ALREADY_EXISTS"));
    }

    const volunteer = await Volunteer.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
      vehicleType: vehicleType || "motorcycle",
      maxServiceRadiusKm: maxServiceRadiusKm || 15,
      availability: availability || {},
      emergencyContact: emergencyContact || {},
      preferredAreas: preferredAreas || [],
      status: "active"
    });

    // Upgrade user role if needed
    await User.findByIdAndUpdate(req.user._id, { role: "Volunteer" });

    await logAudit({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: "Volunteer",
      action: "VOLUNTEER_REGISTERED",
      entityType: "Volunteer",
      entityId: volunteer._id,
      details: { vehicleType }
    });

    return res.status(201).json(successResponse(volunteer, "Registered as volunteer successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "REGISTER_VOLUNTEER_FAILED"));
  }
};

const updateVolunteerStatus = async (req, res) => {
  try {
    const { status, maxServiceRadiusKm, isAvailableNow, currentLat, currentLng } = req.body;

    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json(errorResponse("Volunteer profile not found", "NOT_FOUND"));
    }

    if (status) volunteer.status = status;
    if (maxServiceRadiusKm) volunteer.maxServiceRadiusKm = maxServiceRadiusKm;
    if (typeof isAvailableNow === "boolean") volunteer.isAvailableNow = isAvailableNow;

    if (currentLat && currentLng) {
      volunteer.currentLocation = {
        lat: currentLat,
        lng: currentLng,
        lastUpdated: new Date()
      };
    }

    await volunteer.save();

    return res.status(200).json(successResponse(volunteer, "Volunteer status updated"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "UPDATE_VOLUNTEER_FAILED"));
  }
};

module.exports = {
  getVolunteers,
  getVolunteerProfile,
  registerVolunteer,
  updateVolunteerStatus
};
