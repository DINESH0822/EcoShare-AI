const { Server } = require("socket.io");
const Notification = require("./models/Notification");

let io;
const activeSockets = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join room based on user role or custom user id
    socket.on("authenticate", ({ userId, role }) => {
      if (userId) {
        activeSockets.set(userId, socket.id);
        socket.join(userId);
        console.log(`Socket ${socket.id} joined user room: ${userId}`);
      }
      if (role) {
        socket.join(role);
        console.log(`Socket ${socket.id} joined role room: ${role}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const [userId, socketId] of activeSockets.entries()) {
        if (socketId === socket.id) {
          activeSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

const sendRealtimeNotification = async ({ recipientRole, recipientId, title, message, type }) => {
  try {
    // Create DB entry
    const notification = await Notification.create({
      recipientRole: recipientRole || "All",
      recipientId: recipientId || null,
      title,
      message,
      type: type || "info",
      readBy: []
    });

    if (!io) return notification;

    const payload = {
      _id: notification._id,
      title,
      message,
      type: type || "info",
      createdAt: notification.createdAt,
      read: false
    };

    if (recipientId) {
      // Send to specific user room
      io.to(recipientId.toString()).emit("notification", payload);
    } else if (recipientRole && recipientRole !== "All") {
      // Send to role room
      io.to(recipientRole).emit("notification", payload);
      // Also send to Admins if it's not already sent to them
      if (recipientRole !== "Admin") {
        io.to("Admin").emit("notification", payload);
      }
    } else {
      // Broadcast to everyone
      io.emit("notification", payload);
    }

    return notification;
  } catch (error) {
    console.error("Error creating/sending notification:", error);
  }
};

const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  sendRealtimeNotification,
  getIO
};
