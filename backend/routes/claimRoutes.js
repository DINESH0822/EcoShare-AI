const express = require("express");

const router = express.Router();

const {
  claimFood
} = require("../controllers/claimController");

router.post("/", claimFood);

module.exports = router;