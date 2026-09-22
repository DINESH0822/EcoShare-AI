const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/searchController");
const { optionalProtect } = require("../middleware/authMiddleware");

router.get("/", optionalProtect, globalSearch);

module.exports = router;
