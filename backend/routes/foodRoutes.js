const express = require("express");
const router = express.Router();

const {
  createFood,
  getFoods,
  getFoodById,
  getFoodByTraceabilityId,
  getMatchesForFood,
  deleteFood
} = require("../controllers/foodController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getFoods);
router.get("/trace/:traceabilityId", getFoodByTraceabilityId);
router.get("/:id/match", getMatchesForFood);
router.get("/:id", getFoodById);

router.post("/", protect, createFood);
router.delete("/:id", protect, deleteFood);

module.exports = router;