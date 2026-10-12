const express = require("express");
const router = express.Router();

const {
  registerDonor,
  loginDonor,
  registerNGO,
  loginNGO
} = require("../controllers/authController");

router.post("/donor/register", registerDonor);
router.post("/donor/login", loginDonor);
router.post("/ngo/register", registerNGO);
router.post("/ngo/login", loginNGO);

module.exports = router;
