const Food = require("../models/Food");
const NGO = require("../models/NGO");
const User = require("../models/User");
const Operation = require("../models/Operation");
const Volunteer = require("../models/Volunteer");
const AIRecommendation = require("../models/AIRecommendation");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getAnalytics = async (req, res) => {
  try {
    // 1. Meals Saved (Claimed/Completed food quantity)
    const mealsSavedData = await Food.aggregate([
      { $match: { status: { $in: ["Claimed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    const mealsSaved = mealsSavedData.length > 0 ? mealsSavedData[0].total : 0;

    // Total donations logged
    const totalDonations = await Food.countDocuments();
    const activeDonations = await Food.countDocuments({ status: { $in: ["Available", "published", "ai_matching"] } });

    // 2. People Fed (1:1 with meals saved)
    const peopleFed = mealsSaved;

    // 3. Food Waste Prevented (in kgs: 1 serving ≈ 0.4 kg)
    const foodWastePrevented = parseFloat((mealsSaved * 0.4).toFixed(1));

    // 4. Carbon Emissions Reduced (1 kg food waste ≈ 2.5 kg CO2) - CLEARLY LABELED AS ESTIMATED FORMULA
    const co2Saved = parseFloat((foodWastePrevented * 2.5).toFixed(1));

    // 5. Water Saved (1 serving ≈ 250 Liters of water throughout supply chain)
    const waterSaved = mealsSaved * 250;

    // 6. Equivalent Trees Saved (1 mature tree absorbs ~20kg CO2 per year)
    const treesSaved = parseFloat((co2Saved / 20).toFixed(1));

    // 7. Expired / Discarded Count
    const now = new Date();
    const expiredCount = await Food.countDocuments({
      status: { $nin: ["Claimed", "completed"] },
      expiryTime: { $lt: now }
    });

    // 8. Most Active NGO
    const activeNgoData = await Food.aggregate([
      { $match: { status: { $in: ["Claimed", "completed"] }, claimedBy: { $ne: "" } } },
      { $group: { _id: "$claimedBy", count: { $sum: "$quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostActiveNgo = activeNgoData.length > 0 ? activeNgoData[0]._id : "None yet";

    // 9. Most Donated Food Category
    const activeFoodData = await Food.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostDonatedCategory = activeFoodData.length > 0 ? activeFoodData[0]._id : "cooked_meals";

    // 10. Average Pickup Time (from operations or recommendation ETAs)
    const avgPickupData = await AIRecommendation.aggregate([
      { $group: { _id: null, avgEta: { $avg: "$pickupETA" } } }
    ]);
    const avgPickupTime = avgPickupData.length > 0 ? Math.round(avgPickupData[0].avgEta) : 18;

    // 11. Monthly Trends (from real DB records)
    const monthlyTrends = await Food.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          donated: { $sum: "$quantity" },
          claimed: {
            $sum: {
              $cond: [{ $in: ["$status", ["Claimed", "completed"]] }, "$quantity", 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthlyTrends.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      donated: item.donated,
      claimed: item.claimed,
      wasted: Math.max(0, item.donated - item.claimed)
    }));

    // System counts
    const donorsCount = await User.countDocuments({ role: "Donor" });
    const ngosCount = await NGO.countDocuments();
    const pendingNgos = await NGO.countDocuments({ status: "pending" });
    const activeVolunteersCount = await Volunteer.countDocuments({ status: "active" });
    const totalOperationsCount = await Operation.countDocuments();

    return res.status(200).json({
      success: true,
      mealsSaved,
      peopleFed,
      foodWastePrevented,
      co2Saved,
      waterSaved,
      treesSaved,
      expiredCount,
      mostActiveNgo,
      mostDonatedCategory,
      avgPickupTime,
      totalDonations,
      activeDonations,
      donorsCount,
      ngosCount,
      pendingNgos,
      activeVolunteersCount,
      totalOperationsCount,
      trends: formattedTrends,
      meta: {
        co2Methodology: "ESTIMATED (2.5 kg CO2e / kg food waste prevented based on FAO conversion rates)",
        waterMethodology: "ESTIMATED (250 L virtual water / meal based on lifecycle assessment averages)",
        treesMethodology: "ESTIMATED (20 kg CO2 / mature tree / year)"
      }
    });

  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "FETCH_ANALYTICS_FAILED"));
  }
};

module.exports = {
  getAnalytics
};
