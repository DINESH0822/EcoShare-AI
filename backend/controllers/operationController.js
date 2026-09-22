const Operation = require("../models/Operation");
const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Volunteer = require("../models/Volunteer");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { logAudit } = require("../services/audit");
const { sendNotification } = require("../services/notification");

// Allowed status transition graph
const VALID_TRANSITIONS = {
  "matching": ["matched", "claimed"],
  "matched": ["claimed", "pickup_scheduled"],
  "claim_requested": ["claimed", "matching"],
  "claimed": ["pickup_scheduled", "en_route", "cancelled"],
  "pickup_scheduled": ["en_route", "cancelled"],
  "en_route": ["arrived", "collected", "cancelled"],
  "arrived": ["collected", "cancelled"],
  "collected": ["delivered", "completed"],
  "delivered": ["completed"],
  "completed": [],
  "cancelled": []
};

// Get all operations
const getOperations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) query.status = status;

    if (req.user.role === "NGO") {
      const ngo = await NGO.findOne({ user: req.user._id });
      if (ngo) query.ngoId = ngo._id;
    } else if (req.user.role === "Donor") {
      const foods = await Food.find({ donor: req.user._id }).select("_id");
      query.foodId = { $in: foods.map(f => f._id) };
    } else if (req.user.role === "Volunteer") {
      const vol = await Volunteer.findOne({ user: req.user._id });
      if (vol) query.assignedVolunteer = vol._id;
    }

    const operations = await Operation.find(query)
      .populate("foodId")
      .populate("ngoId")
      .populate("assignedVolunteer")
      .sort({ updatedAt: -1 });

    return res.status(200).json(successResponse(operations, "Operations fetched successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_OPERATIONS_FAILED"));
  }
};

// Get operation by ID
const getOperationById = async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate("foodId")
      .populate("ngoId")
      .populate("assignedVolunteer");

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }

    return res.status(200).json(successResponse(operation));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_OPERATION_FAILED"));
  }
};

// Update operation status with strict state machine validation
const updateOperationStatus = async (req, res) => {
  try {
    const { status, note, proofPhoto, temperatureAtPickup } = req.body;
    const operation = await Operation.findById(req.params.id).populate("foodId");

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }

    // Role check: Volunteers can only update operations assigned to them
    if (req.user.role === "Volunteer") {
      const vol = await Volunteer.findOne({ user: req.user._id });
      if (!vol || (operation.assignedVolunteer && String(operation.assignedVolunteer) !== String(vol._id))) {
        return res.status(403).json(errorResponse("Volunteers can only update operations assigned to them.", "FORBIDDEN_OPERATION_ACCESS"));
      }
    }

    const previousStatus = operation.status;

    // Validate state machine transition graph
    const allowedNext = VALID_TRANSITIONS[previousStatus] || [];
    if (!allowedNext.includes(status) && status !== previousStatus) {
      return res.status(400).json(errorResponse(
        `Invalid status transition from '${previousStatus}' to '${status}'. Allowed transitions: ${allowedNext.join(", ") || "none"}`,
        "INVALID_STATE_TRANSITION"
      ));
    }

    operation.status = status;

    // Record timeline event
    operation.timeline.push({
      status,
      timestamp: new Date(),
      actor: req.user._id,
      actorRole: req.user.role,
      note: note || `Status transitioned to ${status}`
    });

    if (proofPhoto) {
      operation.proofOfPickup = proofPhoto;
    }

    if (status === "collected" && temperatureAtPickup) {
      operation.temperatureAtPickup = temperatureAtPickup;
      if (operation.foodId) {
        operation.foodId.temperatureChecked = true;
        operation.foodId.storageConditionVerified = true;
        await operation.foodId.save();
      }
    }

    if (status === "completed") {
      operation.completedAt = new Date();
      if (operation.foodId) {
        operation.foodId.status = "completed";
        operation.foodId.lifecycleState = "completed";
        operation.foodId.statusHistory.push({
          status: "completed",
          changedBy: req.user._id,
          note: "Food pickup and delivery completed successfully"
        });
        await operation.foodId.save();
      }
    }

    await operation.save();

    await logAudit({
      actor: req.user._id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: "OPERATION_STATUS_UPDATED",
      entityType: "Operation",
      entityId: operation._id,
      details: { previousStatus, newStatus: status, note }
    });

    return res.status(200).json(successResponse(operation, `Operation status updated to ${status}`));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "UPDATE_OPERATION_FAILED"));
  }
};

// Assign volunteer to operation
const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json(errorResponse("Volunteer not found", "NOT_FOUND"));
    }

    operation.assignedVolunteer = volunteer._id;
    operation.status = "pickup_scheduled";
    operation.timeline.push({
      status: "pickup_scheduled",
      timestamp: new Date(),
      actor: req.user._id,
      actorRole: req.user.role,
      note: `Volunteer ${volunteer.name} assigned`
    });

    await operation.save();

    volunteer.currentAssignmentsCount += 1;
    await volunteer.save();

    await sendNotification({
      recipient: volunteer.user,
      type: "volunteer_assigned",
      title: "New Pickup Assigned",
      message: `You have been assigned to food pickup operation ${operation._id}`,
      operationId: operation._id,
      priority: "high"
    });

    return res.status(200).json(successResponse(operation, "Volunteer assigned successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "ASSIGN_VOLUNTEER_FAILED"));
  }
};

module.exports = {
  getOperations,
  getOperationById,
  updateOperationStatus,
  assignVolunteer
};
