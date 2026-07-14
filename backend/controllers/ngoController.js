const NGO = require("../models/NGO");

// Create NGO
const createNGO = async (req, res) => {
  try {
    const {
      ngoName,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      capacity
    } = req.body;

    // Validate GPS coordinates are present
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "GPS coordinates are required. Please pin the NGO location on the map."
      });
    }

    // Validate phone format (10 digits)
    const cleanPhone = String(phone).replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        message: "A valid 10-digit phone number is required."
      });
    }

    const ngo = await NGO.create({
      ngoName,
      contactPerson,
      phone: cleanPhone,
      email,
      // Keep legacy 'location' field for backward compatibility
      location: req.body.location || address,
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      capacity
    });

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