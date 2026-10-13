const Operation = require("../models/Operation");
const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Volunteer = require("../models/Volunteer");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { isValidObjectId } = require("../utils/idValidation");
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

const getReferenceId = (value) => value?._id || value;

const getUserNgo = async (user) => {
  if (user.ngoId) {
    const linkedNgo = await NGO.findById(user.ngoId);
    if (linkedNgo) return linkedNgo;
  }
  return NGO.findOne({ userId: user._id });
};

const getOperationVolunteerId = (operation) => getReferenceId(operation?.assignedVolunteer || operation?.volunteerId);
const getOperationNgoId = (operation) => getReferenceId(operation?.assignedNgo || operation?.ngoId);

const canAccessOperation = async (user, operation) => {
  if (user.role === "Admin") return true;

  if (user.role === "Donor") {
    const foodId = getReferenceId(operation.foodId);
    return Boolean(await Food.exists({ _id: foodId, donorId: user._id }));
  }

  if (user.role === "NGO") {
    const ngoId = getOperationNgoId(operation);
    const ngo = await getUserNgo(user);
    return Boolean(ngo && String(ngo._id) === String(ngoId));
  }

  if (user.role === "Volunteer") {
    return String(getOperationVolunteerId(operation) || "") === String(user._id);
  }

  return false;
};

// Get all operations
const getOperations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) query.status = status;

    if (req.user.role === "NGO") {
      const ngo = await getUserNgo(req.user);
      if (!ngo) return res.status(200).json(successResponse([], "Operations fetched successfully"));
      query.ngoId = ngo._id;
    } else if (req.user.role === "Donor") {
      const foods = await Food.find({ donorId: req.user._id }).select("_id");
      query.foodId = { $in: foods.map(f => f._id) };
    } else if (req.user.role === "Volunteer") {
      const volunteer = await Volunteer.findOne({ userId: req.user._id }).select("_id");
      if (!volunteer) return res.status(200).json(successResponse([], "Operations fetched successfully"));
      query.volunteerId = req.user._id;
    } else if (req.user.role !== "Admin") {
      return res.status(403).json(errorResponse("Your role cannot view rescue operations.", "FORBIDDEN_OPERATION_ACCESS"));
    }

    const operations = await Operation.find(query)
      .populate("foodId")
      .populate("ngoId")
      .populate("assignedNgo")
      .populate("volunteerId", "name email phone role")
      .populate("assignedVolunteer", "name email phone role")
      .sort({ updatedAt: -1 });

    return res.status(200).json(successResponse(operations, "Operations fetched successfully"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_OPERATIONS_FAILED"));
  }
};

// Get operation by ID
const getOperationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(errorResponse("Invalid operation ID. Expected a Mongo ObjectId.", "INVALID_OPERATION_ID"));
    }

    const operation = await Operation.findById(req.params.id)
      .populate("foodId")
      .populate("ngoId")
      .populate("assignedNgo")
      .populate("volunteerId", "name email phone role")
      .populate("assignedVolunteer", "name email phone role");

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }

    if (!(await canAccessOperation(req.user, operation))) {
      return res.status(403).json(errorResponse("You are not allowed to view this operation.", "FORBIDDEN_OPERATION_ACCESS"));
    }

    return res.status(200).json(successResponse(operation));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_OPERATION_FAILED"));
  }
};

// Update operation status with strict state machine validation
const updateOperationStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(errorResponse("Invalid operation ID. Expected a Mongo ObjectId.", "INVALID_OPERATION_ID"));
    }

    const { status, note, proofPhoto, temperatureAtPickup } = req.body;
    const operation = await Operation.findById(req.params.id).populate("foodId");

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }

    if (!( ["Admin", "NGO", "Volunteer"].includes(req.user.role)) || !(await canAccessOperation(req.user, operation))) {
      return res.status(403).json(errorResponse("You are not allowed to update this operation.", "FORBIDDEN_OPERATION_ACCESS"));
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

    if (proofPhoto) operation.pickupPhotoUrl = proofPhoto;

    if (temperatureAtPickup !== undefined && temperatureAtPickup !== null && temperatureAtPickup !== "") {
      const parsedTemperature = Number(temperatureAtPickup);
      if (!Number.isFinite(parsedTemperature)) {
        return res.status(400).json(errorResponse("Pickup temperature must be a number in Celsius.", "INVALID_TEMPERATURE"));
      }
      operation.temperatureAtPickup = parsedTemperature;
      if (operation.foodId) {
        operation.foodId.temperatureChecked = true;
        await operation.foodId.save();
      }
    }

    if (status === "collected") operation.pickupTimestamp = operation.pickupTimestamp || new Date();

    if (status === "completed") {
      operation.deliveryTimestamp = operation.deliveryTimestamp || new Date();
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
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json(errorResponse("Invalid operation ID. Expected a Mongo ObjectId.", "INVALID_OPERATION_ID"));
    }

    const { volunteerId } = req.body;
    if (!isValidObjectId(volunteerId)) {
      return res.status(400).json(errorResponse("A valid volunteer profile ID is required.", "INVALID_VOLUNTEER_ID"));
    }

    const operation = await Operation.findById(req.params.id);

    if (!operation) {
      return res.status(404).json(errorResponse("Operation not found", "NOT_FOUND"));
    }
    if (!["claimed", "matched", "pickup_scheduled"].includes(operation.status)) {
      return res.status(409).json(errorResponse("A volunteer can only be assigned before pickup has started.", "OPERATION_NOT_ASSIGNABLE"));
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json(errorResponse("Volunteer not found", "NOT_FOUND"));
    }
    if (!volunteer.userId) {
      return res.status(409).json(errorResponse("Volunteer profile is not linked to a user account.", "VOLUNTEER_USER_REQUIRED"));
    }
    if (volunteer.status !== "active" || (!volunteer.isAvailable && String(volunteer.currentOperationId || "") !== String(operation._id))) {
      return res.status(409).json(errorResponse("The volunteer is not currently available for assignment.", "VOLUNTEER_UNAVAILABLE"));
    }

    if (operation.volunteerId && String(operation.volunteerId) !== String(volunteer.userId)) {
      const previousVolunteer = await Volunteer.findOne({ userId: operation.volunteerId, currentOperationId: operation._id });
      if (previousVolunteer) {
        previousVolunteer.currentOperationId = undefined;
        previousVolunteer.isAvailable = true;
        await previousVolunteer.save();
      }
    }

    operation.volunteerId = volunteer.userId;
    operation.assignedVolunteer = volunteer.userId;
    operation.volunteerName = volunteer.name;
    operation.status = "pickup_scheduled";
    operation.timeline.push({
      status: "pickup_scheduled",
      timestamp: new Date(),
      actor: req.user._id,
      actorRole: req.user.role,
      note: `Volunteer ${volunteer.name} assigned`
    });

    await operation.save();

    volunteer.currentOperationId = operation._id;
    volunteer.isAvailable = false;
    await volunteer.save();

    await sendNotification({
      recipient: volunteer.userId,
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
