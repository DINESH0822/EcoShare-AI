const express = require("express");
const router = express.Router();
const {
  getVolunteers,
  getVolunteerProfile,
  registerVolunteer,
  updateVolunteerStatus
} = require("../controllers/volunteerController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getVolunteers);
router.get("/profile", getVolunteerProfile);
router.post("/register", registerVolunteer);
router.patch("/status", updateVolunteerStatus);

module.exports = router;
