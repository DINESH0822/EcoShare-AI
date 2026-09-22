import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, API_BASE, getAuthHeaders } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications when user logs in
  const fetchNotifications = async () => {
    if (!user || !API_BASE) return;

    try {
      const res = await axios.get(`${API_BASE}/api/notifications`, getAuthHeaders());
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = API_BASE || "http://localhost:5000";
    const isLocalDemo = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (!socketUrl || isLocalDemo) {
      setSocket(null);
      return;
    }

    const newSocket = io(socketUrl, {
      reconnection: false,
      timeout: 1500,
      autoConnect: true
    });

    const handleSocketDown = () => {
      setSocket(null);
      newSocket.close();
    };

    newSocket.on("connect", () => {
      newSocket.emit("authenticate", { userId: user._id, role: user.role });
    });

    newSocket.on("connect_error", handleSocketDown);

    newSocket.on("notification", (notification) => {
      toast(notification.title + "\n" + notification.message, {
        icon: notification.type === "new_donation" ? "🍱" : notification.type === "claimed" ? "🎉" : "🔔",
        style: {
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
        }
      });
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, API_BASE]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await axios.put(`${API_BASE}/api/notifications/read-all`, {}, getAuthHeaders());
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    if (!user) return;
    try {
      await axios.put(`${API_BASE}/api/notifications/${id}/read`, {}, getAuthHeaders());
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
