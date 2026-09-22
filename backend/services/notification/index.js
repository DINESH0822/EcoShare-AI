const Notification = require("../../models/Notification");
const { getIO } = require("../../socket");

/**
 * Centralized Notification Service Abstraction
 * Supports in-app DB persistence, socket.io real-time push, and extensibility for Email/SMS/Push providers.
 */

const sendNotification = async ({
  recipient,
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
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      foodId,
      ngoId,
      operationId,
      claimId,
      priority,
      metadata,
      read: false
    });

    // Real-time socket delivery if socket server initialized
    try {
      const io = getIO();
      if (io) {
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
