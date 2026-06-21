const NGO = require("../models/NGO");

// Create NGO
const createNGO = async (req, res) => {
  try {
    const ngo = await NGO.create(req.body);

    res.status(201).json(ngo);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get NGOs
const getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find();

    res.status(200).json(ngos);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Delete NGO
const deleteNGO = async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndDelete(
      req.params.id
    );

    if (!ngo) {
      return res.status(404).json({
        message: "NGO not found"
      });
    }

    res.status(200).json({
      message: "NGO deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createNGO,
  getNGOs,
  deleteNGO
};