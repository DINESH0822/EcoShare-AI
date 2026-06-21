const express = require("express");
const router = express.Router();

const {
  createFood,
  getFoods,
  deleteFood
} = require("../controllers/foodController");

router.post("/", createFood);
router.get("/", getFoods);
router.delete("/:id", deleteFood);

module.exports = router;