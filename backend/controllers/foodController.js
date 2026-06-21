const Food = require("../models/Food");

// Create Food Donation
const createFood = async (req, res) => {
  try {
    const {
      foodName,
      quantity,
      donorName,
      donorType,
      location,
      expiryTime
    } = req.body;

    const food = await Food.create({
      foodName,
      quantity,
      donorName,
      donorType,
      location,
      expiryTime
    });

    res.status(201).json(food);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get All Food Donations
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();

    res.status(200).json(foods);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete Food Donation
const deleteFood = async (req, res) => {
  try {

    console.log("DELETE HIT");
    console.log(req.params.id);

    const deletedFood = await Food.findByIdAndDelete(
      req.params.id
    );

    if (!deletedFood) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    res.status(200).json({
      message: "Food deleted successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message
    });
  }
};
module.exports = {
  createFood,
  getFoods,
  deleteFood
};