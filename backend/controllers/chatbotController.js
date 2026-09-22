const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Claim = require("../models/Claim");
const Operation = require("../models/Operation");
const Volunteer = require("../models/Volunteer");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Real DB-driven Intent Engine for EcoBot Assistant
const handleChatQuery = async (req, res) => {
  try {
    const { message, context = {}, confirmAction } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json(errorResponse("Message string required", "INVALID_INPUT"));
    }

    const text = message.toLowerCase().trim();
    const userId = req.user ? req.user._id : null;
    const userRole = req.user ? req.user.role : "Guest";

    let reply = "";
    let suggestions = [];
    let quickActions = [];
    let dataPayload = null;
    let requiresConfirmation = false;

    // 1. Tool Intent: "What donations do I have?" / "My donations"
    if (text.includes("my donation") || text.includes("donations i have") || text.includes("my posted food")) {
      if (!userId) {
        reply = "🔒 You need to be signed in as a Donor to view your listed donations. Please log in first.";
        quickActions = [{ label: "Sign In", action: "/login" }];
      } else {
        const userFoods = await Food.find({ $or: [{ donor: userId }, { donorId: userId }] })
          .sort({ createdAt: -1 })
          .limit(5);

        if (userFoods.length === 0) {
          reply = "📦 **You currently have 0 posted donations.**\n\nWould you like to post surplus food now?";
          quickActions = [{ label: "+ Add Food", action: "/add-food" }];
        } else {
          const foodListStr = userFoods.map((f, idx) => 
            `${idx + 1}. **${f.foodName}** — ${f.quantity} servings (${f.status}) • ID: \`${f.traceabilityId || f._id}\``
          ).join("\n");

          reply = `📋 **Your Posted Food Donations (${userFoods.length}):**\n\n${foodListStr}`;
          suggestions = ["Status of my latest donation", "Show my claims", "How does AI matching work?"];
          quickActions = [{ label: "View All Donations", action: "/donations" }];
        }
      }

    // 2. Tool Intent: "Show my claims" / "My pending claims"
    } else if (text.includes("my claim") || text.includes("pending claim") || text.includes("claimed by me")) {
      if (!userId) {
        reply = "🔒 Please sign in to view your organization's claimed donations.";
        quickActions = [{ label: "Sign In", action: "/login" }];
      } else {
        const userClaims = await Claim.find({ claimedBy: userId }).populate("foodId").sort({ createdAt: -1 }).limit(5);
        if (userClaims.length === 0) {
          reply = "ℹ️ **No active claim requests found** for your account.";
          quickActions = [{ label: "Browse Available Food", action: "/donations" }];
        } else {
          const claimsStr = userClaims.map((c, idx) => 
            `${idx + 1}. **${c.foodId?.foodName || "Food Item"}** — Status: **${c.status.toUpperCase()}** • Claimed: ${new Date(c.requestedAt).toLocaleTimeString()}`
          ).join("\n");
          reply = `🏷️ **Your Claim Requests (${userClaims.length}):**\n\n${claimsStr}`;
          quickActions = [{ label: "View Operations Kanban", action: "/operations" }];
        }
      }

    // 3. Tool Intent: "What pickups are assigned to me?" / "My pickups"
    } else if (text.includes("pickup") || text.includes("assigned to me") || text.includes("my task")) {
      if (!userId) {
        reply = "🔒 Sign in with a Volunteer account to view your assigned pickup tasks.";
      } else {
        const volunteer = await Volunteer.findOne({ user: userId });
        if (!volunteer) {
          reply = "🚲 You are not registered as a Volunteer yet. Would you like to register?";
          quickActions = [{ label: "Register as Volunteer", action: "/volunteers" }];
        } else {
          const ops = await Operation.find({ assignedVolunteer: volunteer._id }).populate("foodId").sort({ updatedAt: -1 });
          if (ops.length === 0) {
            reply = "📦 **You have 0 pending pickup assignments.** Great job!";
          } else {
            const opsStr = ops.map((op, idx) => 
              `${idx + 1}. **${op.foodId?.foodName || "Pickup Task"}** — Status: **${op.status.toUpperCase()}** • Pickup Location: ${op.foodId?.address || "Location set"}`
            ).join("\n");
            reply = `🚚 **Your Active Pickup Assignments (${ops.length}):**\n\n${opsStr}`;
            quickActions = [{ label: "Open Operations Board", action: "/operations" }];
          }
        }
      }

    // 4. Tool Intent: "Which NGOs can accept my donation?" / "Nearest NGO" / "Eligible NGOs"
    } else if (text.includes("nearest ngo") || text.includes("eligible ngo") || text.includes("which ngo")) {
      const verifiedNgos = await NGO.find({ $or: [{ status: "approved" }, { verificationStatus: "verified" }] })
        .sort({ rating: -1 })
        .limit(5);

      if (verifiedNgos.length === 0) {
        reply = "🏢 **No verified partner NGOs found in your area yet.** Admin approval pending.";
      } else {
        const ngoList = verifiedNgos.map((n, i) => 
          `${i + 1}. **${n.ngoName}** (${n.city || "Local"}) — Cap: ${n.capacity} servings/day • Rating: ${n.rating || 4.9}⭐`
        ).join("\n");
        reply = `🏢 **Top Verified Partner Recipient NGOs:**\n\n${ngoList}\n\n*All NGOs undergo strict verification audit before receiving food dispatches.*`;
        quickActions = [{ label: "View NGO Directory", action: "/ngos" }];
      }

    // 5. Tool Intent: Food Safety Guidelines
    } else if (text.includes("safety") || text.includes("temp") || text.includes("rule")) {
      reply = "🛡️ **Food Safety Protocols:**\n\n" +
        "• **Hot Cooked Food:** Must be maintained >60°C. Maximum 4 hours shelf life post-cooking.\n" +
        "• **Refrigerated Items:** Below 4°C with intact seal.\n" +
        "• **Allergen Checks:** Must tag nuts, dairy, or gluten if present.";
      suggestions = ["What donations do I have?", "Nearest NGO", "How does AI matching work?"];

    // Default Fallback Response
    } else {
      reply = `👋 Hi ${req.user ? req.user.name : "there"}! I'm **EcoBot**, your live database assistant.\n\n` +
        "I can execute real-time application queries:\n" +
        "• *'What donations do I have?'*\n" +
        "• *'Show my pending claims'*\n" +
        "• *'What pickups are assigned to me?'*\n" +
        "• *'Which NGOs can accept my donation?'*\n\n" +
        "How can I assist you?";
      suggestions = ["What donations do I have?", "Show my pending claims", "Nearest NGO", "Food Safety Rules"];
    }

    return res.status(200).json(successResponse({
      reply,
      suggestions,
      quickActions,
      requiresConfirmation,
      timestamp: new Date()
    }, "EcoBot database query processed"));
  } catch (error) {
    return res.status(500).json(errorResponse(error.message, "ECOBOT_QUERY_FAILED"));
  }
};

module.exports = {
  handleChatQuery
};
