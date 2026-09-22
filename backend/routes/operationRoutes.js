const express = require("express");
const router = express.Router();
const {
  getOperations,
  getOperationById,
  updateOperationStatus,
  assignVolunteer
} = require("../controllers/operationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getOperations);
router.get("/:id", getOperationById);
router.patch("/:id/status", updateOperationStatus);
router.post("/:id/assign-volunteer", assignVolunteer);

module.exports = router;
