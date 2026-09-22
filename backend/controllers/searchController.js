const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Claim = require("../models/Claim");
const Operation = require("../models/Operation");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json(successResponse({ donations: [], ngos: [], claims: [], operations: [] }));
    }

    const regex = new RegExp(q.trim(), "i");

    const donations = await Food.find({
      $or: [{ foodName: regex }, { address: regex }, { traceId: regex }, { donorName: regex }]
    }).limit(5);

    const ngos = await NGO.find({
      $or: [{ ngoName: regex }, { city: regex }, { address: regex }, { contactPerson: regex }]
    }).limit(5);

    let claims = [];
    let operations = [];

    if (req.user) {
      claims = await Claim.find({ ngoName: regex }).populate("foodId").limit(5);
      operations = await Operation.find({
        $or: [{ assignedNgoName: regex }, { status: regex }]
      }).populate("foodId").limit(5);
    }

    return res.status(200).json(successResponse({
      donations,
      ngos,
      claims,
      operations
    }, "Global search results"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "SEARCH_FAILED"));
  }
};

module.exports = { globalSearch };
