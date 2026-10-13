const mongoose = require("mongoose");
const { getIO } = require("../socket");
const { successResponse } = require("../utils/apiResponse");
const { getMlServiceHealth } = require("../services/mlService");

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
  const routingProvider = process.env.ROUTING_PROVIDER || "development";
  const geocodingProvider = process.env.GEOCODING_PROVIDER || "development";

  const integrations = {
    backend: { status: "HEALTHY", provider: "Express API responded successfully" },
    database: { status: dbStatus, provider: "MongoDB Atlas" },
    socket: {
      status: socketStatus,
      provider: "Socket.io server",
      note: "Server initialization is checked; connected-client delivery is not probed."
    },
    ai: await getMlServiceHealth(),
    maps: { status: "CONFIGURED", provider: "Leaflet client map; external tile availability is not probed" },
    geocoding: {
      status: geocodingProvider === "development" ? "DEGRADED" : "CONFIGURED",
      provider: geocodingProvider,
      note: geocodingProvider === "development" ? "Development provider does not perform address geocoding." : undefined
    },
    routing: {
      status: routingProvider === "development" ? "DEGRADED" : "CONFIGURED",
      provider: routingProvider,
      note: routingProvider === "development" ? "Uses straight-line-based estimates without live traffic." : undefined
    },
    email: { status: hasEmail ? "CONFIGURED" : "NOT_CONFIGURED", provider: "SMTP Mailer", note: "Configuration presence only; delivery is not probed." },
    whatsApp: { status: hasWhatsApp ? "CONFIGURED" : "NOT_CONFIGURED", provider: "WhatsApp Business API", note: "Configuration presence only; delivery is not probed." },
    sms: { status: hasSMS ? "CONFIGURED" : "NOT_CONFIGURED", provider: "Twilio Gateway", note: "Configuration presence only; delivery is not probed." },
    firebase: { status: hasFirebase ? "CONFIGURED" : "NOT_CONFIGURED", provider: "Firebase Phone Auth", note: "Configuration presence only; authentication is not probed." },
    storage: { status: "HEALTHY", provider: "Local / GridFS Asset Storage" }
  };

  return res.status(200).json(successResponse(integrations, "Integrations Health Status"));
};

module.exports = {
  getHealthStatus,
  getIntegrationsHealth
};
