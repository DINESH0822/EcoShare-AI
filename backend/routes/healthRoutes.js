const express = require("express");
const router = express.Router();
const { getHealthStatus, getIntegrationsHealth } = require("../controllers/healthController");

router.get("/", getHealthStatus);
router.get("/integrations", getIntegrationsHealth);

module.exports = router;
