const Food = require("../models/Food");

const claimFood = async (req, res) => {
  try {
    const { foodId, ngoName } = req.body;

    const food = await Food.findById(foodId);

    if (!food) {
      return res.status(404).json({
        message: "Food not found"
      });
    }

    food.status = "Claimed";
    food.claimedBy = ngoName;

    await food.save();

    res.status(200).json(food);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  claimFood
};