/**
 * Audit Log Service
 * Centralized audit logging for all important platform actions.
 */
const AuditLog = require("../../models/AuditLog");

/**
 * Create an audit log entry.
 * This is fire-and-forget — never block the main request on audit logging.
 */
const createAuditLog = async ({
  actor,
  actorName,
  actorRole,
  action,
  entityType,
  entityId,
  entityLabel,
  result = "success",
  metadata,
  note,
  req
}) => {
  try {
    await AuditLog.create({
      actor: actor || null,
      actorName: actorName || "System",
      actorRole: actorRole || "System",
      action,
      entityType,
      entityId,
      entityLabel,
      result,
      metadata,
      note,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || null,
      userAgent: req?.headers?.["user-agent"] || null
    });
  } catch (err) {
    // Never let audit failures crash the main operation
    console.error("[AuditLog] Failed to write audit entry:", err.message);
  }
};

module.exports = { createAuditLog };
