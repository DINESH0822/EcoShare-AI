const express = require("express");
const router = express.Router();
const { handleChatQuery } = require("../controllers/chatbotController");
const { optionalProtect } = require("../middleware/authMiddleware");

router.post("/query", optionalProtect, handleChatQuery);

module.exports = router;
