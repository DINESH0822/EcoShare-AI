const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, actorRole, limit = 50, page = 1 } = req.query;
    let query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (actorRole) query.actorRole = actorRole;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    return res.status(200).json(successResponse({
      logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    }, "Audit logs retrieved"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_AUDIT_LOGS_FAILED"));
  }
};

module.exports = {
  getAuditLogs
};
