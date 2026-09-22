const History = require("../models/History");
const Food = require("../models/Food");

const getHistory = async (req, res) => {
  try {
    const { foodId } = req.query;

    if (foodId) {
      const history = await History.find({ foodId }).sort({ createdAt: 1 });
      return res.status(200).json(history);
    }

    const history = await History.find()
      .populate({
        path: "foodId",
        select: "foodName quantity donorName status"
      })
      .sort({ createdAt: -1 })
      .limit(100);

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