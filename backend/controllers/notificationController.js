const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const { role, _id } = req.user;
    
    // Find notifications matching "All", user's role, or specifically for user's _id
    const notifications = await Notification.find({
      $or: [
        { recipientRole: "All" },
        { recipientRole: role },
        { recipientId: _id }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    const formatted = notifications.map(n => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
      read: n.readBy.includes(_id)
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;

    const notifications = await Notification.find({
      $or: [
        { recipientRole: "All" },
        { recipientRole: role },
        { recipientId: userId }
      ],
      readBy: { $ne: userId }
    });

    for (const n of notifications) {
      n.readBy.push(userId);
      await n.save();
    }

    res.status(200).json({ success: true, count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
