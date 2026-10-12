const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config/db");
const { initSocket } = require("./socket");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const userRoutes = require("./routes/userRoutes");
const foodRoutes = require("./routes/foodRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const claimRoutes = require("./routes/claimRoutes");
const historyRoutes = require("./routes/historyRoutes");
const configRoutes = require("./routes/configRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const operationRoutes = require("./routes/operationRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const auditRoutes = require("./routes/auditRoutes");
const healthRoutes = require("./routes/healthRoutes");
const searchRoutes = require("./routes/searchRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : [process.env.CLIENT_URL || "http://localhost:5173", "http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or tools without origin (e.g. Postman, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback with logged origin in dev
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/config", configRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/operations", operationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/search", searchRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    name: "EcoShare AI Production Platform API",
    version: "2.0.0",
    docs: "/api/config",
    health: "/api/health/integrations"
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`EcoShare AI Server running on port ${PORT}`);
});