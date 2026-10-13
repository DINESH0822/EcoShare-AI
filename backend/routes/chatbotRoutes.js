const express = require("express");
const router = express.Router();
const { handleChatQuery } = require("../controllers/chatbotController");
const { protect } = require("../middleware/authMiddleware");

router.post("/query", protect, handleChatQuery);

module.exports = router;
