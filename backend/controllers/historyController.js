const Food = require("../models/Food");

const getHistory = async (req, res) => {
  try {
    const history = await Food.find({
      status: "Claimed"
    });

    res.status(200).json(history);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getHistory
};