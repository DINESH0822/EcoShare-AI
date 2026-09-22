const express = require("express");
const router = express.Router();
const { registerOrganization, createPartnershipInvite } = require("../controllers/organizationController");
const { protect, optionalProtect, authorize } = require("../middleware/authMiddleware");

router.post("/register", optionalProtect, registerOrganization);
router.post("/invite", protect, authorize("Admin", "Donor"), createPartnershipInvite);

module.exports = router;
