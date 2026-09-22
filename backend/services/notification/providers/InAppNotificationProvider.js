const Notification = require("../../../models/Notification");
const { getIO } = require("../../../socket");

const sendInApp = async ({ recipient, title, message, type = "info", metadata = {} }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      metadata,
      read: false
    });

    try {
      const io = getIO();
      if (io && recipient) {
        io.to(recipient.toString()).emit("notification", {
          _id: notification._id,
          title,
          message,
          type,
          createdAt: notification.createdAt,
          read: false
        });
      }
    } catch (e) {}

    return { status: "SENT", provider: "InApp", notificationId: notification._id };
  } catch (err) {
    return { status: "FAILED", provider: "InApp", error: err.message };
  }
};

module.exports = { sendInApp };
