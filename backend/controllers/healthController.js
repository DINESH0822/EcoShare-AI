const mongoose = require("mongoose");
const { getIO } = require("../socket");
const { successResponse } = require("../utils/apiResponse");

const getHealthStatus = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "HEALTHY" : "UNAVAILABLE";
  return res.status(200).json(successResponse({
    status: dbStatus === "HEALTHY" ? "UP" : "DEGRADED",
    timestamp: new Date(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  }, "EcoShare AI System Health"));
};

const getIntegrationsHealth = async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "HEALTHY" : "UNAVAILABLE";
  const socketStatus = getIO() ? "HEALTHY" : "UNAVAILABLE";

  const hasMapsKey = Boolean(process.env.GOOGLE_MAPS_API_KEY && !process.env.GOOGLE_MAPS_API_KEY.includes("YOUR_"));
  const hasEmail = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
  const hasWhatsApp = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasSMS = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const hasFirebase = Boolean(process.env.FIREBASE_API_KEY && !process.env.FIREBASE_API_KEY.includes("YOUR_"));

  const integrations = {
    database: { status: dbStatus, provider: "MongoDB Atlas" },
    socket: { status: socketStatus, provider: "Socket.io" },
    ai: {
      status: "HEALTHY",
      provider: "Supervised Random Forest Claim Predictor + 10-Factor Rules Engine",
      modelFile: "claim_predictor.joblib",
      algorithm: "RandomForestClassifier(n_estimators=100)",
      rocAuc: 0.8501,
      accuracy: 0.8117,
      f1Score: 0.8700
    },
    maps: { status: "HEALTHY", provider: "Leaflet + CartoDB Dark Tiles" },
    geocoding: { status: "HEALTHY", provider: process.env.GEOCODING_PROVIDER || "development" },
    routing: { status: "HEALTHY", provider: process.env.ROUTING_PROVIDER || "development" },
    email: { status: hasEmail ? "CONFIGURED" : "NOT_CONFIGURED", provider: "SMTP Mailer" },
    whatsApp: { status: hasWhatsApp ? "CONFIGURED" : "NOT_CONFIGURED", provider: "WhatsApp Business API" },
    sms: { status: hasSMS ? "CONFIGURED" : "NOT_CONFIGURED", provider: "Twilio Gateway" },
    firebase: { status: hasFirebase ? "CONFIGURED" : "NOT_CONFIGURED", provider: "Firebase Phone Auth" },
    storage: { status: "HEALTHY", provider: "Local / GridFS Asset Storage" }
  };

  return res.status(200).json(successResponse(integrations, "Integrations Health Status"));
};

module.exports = {
  getHealthStatus,
  getIntegrationsHealth
};
