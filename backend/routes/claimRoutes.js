const express = require("express");
const router = express.Router();
const { claimFood, getClaims } = require("../controllers/claimController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, claimFood);
router.get("/", protect, getClaims);

module.exports = router;