const Notification = require("../../models/Notification");
const { getIO } = require("../../socket");

/**
 * Centralized Notification Service Abstraction
 * Supports in-app DB persistence, socket.io real-time push, and extensibility for Email/SMS/Push providers.
 */

const sendNotification = async ({
  recipient,
  recipientRole = "All",
  type,
  title,
  message,
  foodId = null,
  ngoId = null,
  operationId = null,
  claimId = null,
  priority = "normal",
  metadata = {}
}) => {
  try {
    const entity = operationId
      ? { entityType: "Operation", entityId: operationId }
      : claimId
        ? { entityType: "Claim", entityId: claimId }
        : foodId
          ? { entityType: "Food", entityId: foodId }
          : ngoId
            ? { entityType: "NGO", entityId: ngoId }
            : {};

    const notification = await Notification.create({
      recipientId: recipient || null,
      recipientRole,
      type,
      title,
      message,
      ...entity,
      priority: priority === "normal" ? "medium" : priority
    });

    // Real-time socket delivery if socket server initialized
    try {
      const io = getIO();
      if (io && recipient) {
        io.to(recipient.toString()).emit("notification", notification);
      }
    } catch (sockErr) {
      // Socket emission is best-effort
    }

    return notification;
  } catch (err) {
    console.error("Failed to send notification:", err.message);
    return null;
  }
};

const notifyMultipleUsers = async (userIds, notificationPayload) => {
  const promises = userIds.map((userId) =>
    sendNotification({ ...notificationPayload, recipient: userId })
  );
  return Promise.allSettled(promises);
};

module.exports = {
  sendNotification,
  notifyMultipleUsers
};
