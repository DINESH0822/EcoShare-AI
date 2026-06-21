const express = require("express");

const router = express.Router();

const {
  createNGO,
  getNGOs,
  deleteNGO
} = require("../controllers/ngoController");

router.post("/", createNGO);

router.get("/", getNGOs);

router.delete("/:id", deleteNGO);

module.exports = router;