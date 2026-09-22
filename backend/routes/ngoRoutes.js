const express = require("express");
const router = express.Router();
const {
  createNGO,
  getNGOs,
  getNGOById,
  deleteNGO,
  approveNGO,
  rejectNGO
} = require("../controllers/ngoController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Allow public to fetch NGOs, but protect create/delete/approve
router.get("/", getNGOs);
router.get("/:id", getNGOById);
router.post("/", protect, createNGO);
router.delete("/:id", protect, authorize("Admin"), deleteNGO);
router.put("/:id/approve", protect, authorize("Admin"), approveNGO);
router.put("/:id/reject", protect, authorize("Admin"), rejectNGO);

module.exports = router;