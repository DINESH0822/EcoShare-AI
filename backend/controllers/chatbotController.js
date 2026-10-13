const Food = require("../models/Food");
const NGO = require("../models/NGO");
const Claim = require("../models/Claim");
const Operation = require("../models/Operation");
const Volunteer = require("../models/Volunteer");
const { classifyIntent } = require("../services/chatbotIntent");
const { getProjectAnswer } = require("../services/projectKnowledge");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const ACTIVE_DONATION_STATUSES = ["Available", "published", "ai_matching", "match_found"];
const COMPLETED_OPERATION_STATUSES = ["completed", "delivered"];
const PENDING_CLAIM_STATUSES = ["requested", "approved"];

const verifiedNgoFilter = {
  isActive: { $ne: false },
  $or: [{ status: "approved" }, { verificationStatus: { $in: ["verified", "VERIFIED"] } }]
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUserNgo = async (user) => {
  if (user.ngoId) {
    const linkedNgo = await NGO.findById(user.ngoId);
    if (linkedNgo) return linkedNgo;
  }
  return NGO.findOne({ userId: user._id });
};

const getFoodScope = async (user, { availableOnly = false } = {}) => {
  if (user.role === "Donor" && !availableOnly) return { donorId: user._id };
  if (user.role === "Admin" && !availableOnly) return {};
  return {
    status: { $in: ACTIVE_DONATION_STATUSES },
    expiryTime: { $gt: new Date() }
  };
};

const getOperationScope = async (user) => {
  if (user.role === "Admin") return {};
  if (user.role === "Donor") {
    const foods = await Food.find({ donorId: user._id }).select("_id").lean();
    return { foodId: { $in: foods.map((food) => food._id) } };
  }
  if (user.role === "NGO") {
    const ngo = await getUserNgo(user);
    return ngo ? { ngoId: ngo._id } : null;
  }
  if (user.role === "Volunteer") return { volunteerId: user._id };
  return null;
};

const getClaimScope = async (user) => {
  if (user.role === "Admin") return {};
  if (user.role === "NGO") {
    const ngo = await getUserNgo(user);
    return ngo ? { ngoId: ngo._id } : null;
  }
  if (user.role === "Donor") {
    const foods = await Food.find({ donorId: user._id }).select("_id").lean();
    return { foodId: { $in: foods.map((food) => food._id) } };
  }
  return null;
};

const formatDonation = (food) => {
  const expires = food.expiryTime ? new Date(food.expiryTime).toLocaleString() : "expiry not recorded";
  const quantity = food.quantity == null ? "quantity not recorded" : `${food.quantity} ${food.quantityUnit || "meals"}`;
  return `${food.foodName}: ${quantity}; status ${food.status}; expires ${expires}; reference ${food.traceId || food._id}`;
};

const formatOperation = (operation) => {
  const foodName = operation.foodId?.foodName || operation.foodName || "Food item";
  const address = operation.foodId?.address || operation.pickupAddress || "pickup location not recorded";
  const quantity = operation.foodId?.quantity ?? operation.quantity;
  const quantityLabel = quantity == null ? "quantity not recorded" : `${quantity} ${operation.foodId?.quantityUnit || "meals"}`;
  return `${foodName} (${quantityLabel}) — ${operation.status.replace(/_/g, " ")}; pickup: ${address}; operation ${operation._id}`;
};

const haversineDistanceKm = (lat1, lng1, lat2, lng2) => {
  const radians = (degrees) => degrees * Math.PI / 180;
  const latitudeDelta = radians(lat2 - lat1);
  const longitudeDelta = radians(lng2 - lng1);
  const arc = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
};

const findDonationIdentifier = (text) => text.match(/\bES-DON-\d{4}-\d+\b|\b[a-f\d]{24}\b/i)?.[0];

const handleChatQuery = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json(errorResponse("Message string required", "INVALID_INPUT"));
    }

    const user = req.user;
    const text = message.trim();
    const previousIntent = typeof context.previousIntent === "string" ? context.previousIntent : undefined;
    const intent = classifyIntent(text, previousIntent);
    let reply;
    let suggestions = [];
    let quickActions = [];

    const projectAnswer = getProjectAnswer(intent);
    if (projectAnswer) {
      ({ reply, suggestions = [], quickActions = [] } = projectAnswer);
    } else if (intent === "greeting" || intent === "help") {
      reply = `Hello${user.name ? `, ${user.name.split(" ")[0]}` : ""}. I can look up your donations, claims, pickups, organization records, and completed rescues, or explain the platform workflows.`;
      suggestions = user.role === "Donor"
        ? ["What donations do I have?", "Which donations expire soon?", "How much food have I rescued?"]
        : ["Show my pending claims", "Any pending pickup?", "Available food donations"];
      quickActions = [{ label: "Open Operations", action: "/operations" }, { label: "Open Organizations", action: "/organizations" }];
    } else if (intent === "workflow") {
      if (/donation|food/i.test(text) && /create|post|register|add/i.test(text)) {
        reply = "To publish surplus food, open Add Food, enter the food details, quantity, pickup location, storage information, and expiry time, then submit the listing. Use the donation form’s stored details accurately; EcoBot cannot create a listing for you.";
        quickActions = [{ label: "Open Add Food", action: "/add-food" }];
        suggestions = ["What donations do I have?", "Which donations expire soon?", "How does AI matching work?"];
      } else if (/ngo|organization/i.test(text) && /register|sign up/i.test(text)) {
        reply = "Register the organization through the NGO registration form. Its verification status remains pending until an administrator reviews it.";
        quickActions = [{ label: "NGO registration", action: "/ngo/register" }];
        suggestions = ["Show verified organizations", "Show available food donations", "Food safety guidance"];
      } else if (/volunteer/i.test(text) && /register|sign up/i.test(text)) {
        reply = "Sign in with an existing account, then use the volunteer registration workflow available to your account. I cannot register or assign a volunteer from chat.";
        quickActions = [{ label: "Sign in", action: "/login" }];
        suggestions = ["Show my assigned pickups", "Open Operations", "How does AI matching work?"];
      } else {
        reply = "Open Operations to review rescue missions, status changes, pickup details, and completed handoffs available to your account.";
        quickActions = [{ label: "Open Operations", action: "/operations" }];
        suggestions = ["Show my assigned pickups", "Show completed deliveries", "How much food have we rescued?"];
      }
    } else if (intent === "my_donations") {
      if (user.role !== "Donor") {
        reply = "This account is not a donor account, so it has no personal donor listings to retrieve. Sign in with the donor account that created the donations.";
        quickActions = [{ label: "Donor sign in", action: "/donor/login" }];
      } else {
        const foods = await Food.find({ donorId: user._id }).sort({ createdAt: -1 }).limit(8).lean();
        reply = foods.length
          ? `Your ${foods.length} most recent donation record${foods.length === 1 ? "" : "s"}:\n${foods.map((food) => `• ${formatDonation(food)}`).join("\n")}`
          : "No donations are recorded for your donor account yet.";
        suggestions = ["What is the status of my latest donation?", "Which donations expire soon?", "Show my claims"];
        quickActions = [{ label: "Open Donations", action: "/donations" }, { label: "Create a donation", action: "/add-food" }];
      }
    } else if (intent === "available_donations") {
      const foods = await Food.find(await getFoodScope(user, { availableOnly: true }))
        .sort({ isEmergency: -1, expiryTime: 1, createdAt: -1 }).limit(8).lean();
      reply = foods.length
        ? `Available, unexpired donations (${foods.length} shown):\n${foods.map((food) => `• ${formatDonation(food)}`).join("\n")}`
        : "There are no available, unexpired donations in the records I can show for your account.";
      suggestions = ["Which donations expire soon?", "How does AI matching work?", "Show my pending claims"];
      quickActions = [{ label: "Browse Donations", action: "/donations" }];
    } else if (intent === "expiring_donations") {
      const foods = await Food.find({
        ...(await getFoodScope(user)),
        expiryTime: { $gt: new Date(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      }).sort({ expiryTime: 1 }).limit(8).lean();
      reply = foods.length
        ? `Donations with a recorded expiry in the next 24 hours (${foods.length} shown):\n${foods.map((food) => `• ${formatDonation(food)}`).join("\n")}`
        : "No accessible donations have a recorded expiry within the next 24 hours.";
      suggestions = ["Show available food donations", "How does AI matching work?", "Open Operations"];
      quickActions = [{ label: "Open Donations", action: "/donations" }];
    } else if (intent === "donation_details") {
      const scope = await getFoodScope(user);
      const identifier = findDonationIdentifier(text);
      const identifierFilter = identifier
        ? (identifier.toUpperCase().startsWith("ES-DON-") ? { traceId: identifier.toUpperCase() } : { _id: identifier })
        : {};
      const food = await Food.findOne({ ...scope, ...identifierFilter }).sort({ createdAt: -1 }).lean();
      reply = food
        ? formatDonation(food)
        : identifier
          ? "I could not find a donation matching that reference within the records your account can access."
          : user.role === "Donor"
            ? "No donation is recorded for your account yet. Include a donation reference or create a listing first."
            : "I need a donation reference to look up its status. You can also browse available donations.";
      suggestions = ["What donations do I have?", "Which donations expire soon?", "How do I create a donation?"];
      quickActions = [{ label: "Open Donations", action: "/donations" }];
    } else if (intent === "claims") {
      const scope = await getClaimScope(user);
      if (!scope) {
        reply = "Claims are available to donor accounts for their own donations and NGO accounts for their organization. This account has no claim records to query.";
      } else {
        const wantsPending = /\bpending\b|\brequested\b/i.test(text);
        const claims = await Claim.find({
          ...scope,
          ...(wantsPending ? { status: { $in: PENDING_CLAIM_STATUSES } } : {})
        }).populate("foodId", "foodName quantity quantityUnit").sort({ updatedAt: -1 }).limit(8).lean();
        reply = claims.length
          ? `${wantsPending ? "Pending" : "Recent"} claims (${claims.length} shown):\n${claims.map((claim) => `• ${claim.foodId?.foodName || "Donation"} — ${claim.status}; ${claim.ngoName}; reference ${claim._id}`).join("\n")}`
          : `No ${wantsPending ? "pending " : ""}claims were found in the records available to your account.`;
      }
      suggestions = ["Show my operations", "Show available food donations", "How do I track a rescue?"];
      quickActions = [{ label: "Open Operations", action: "/operations" }];
    } else if (intent === "verification") {
      reply = "New NGO accounts are stored with pending verification. An administrator reviews the organization and uses the approval workflow to set its status to approved and verification status to verified. The claim endpoint checks that verification state before accepting a claim.";
      suggestions = ["Show verified organizations", "What is my organization capacity?", "How do I register an NGO?"];
      quickActions = [{ label: "Open Organizations", action: "/organizations" }];
    } else if (intent === "organizations" || intent === "organization_details") {
      const cityMatch = intent === "organizations"
        ? text.replace(/[?.!]\s*$/, "").match(/\b(?:in|near|around)\s+([a-z][a-z .'-]{1,40})\s*$/i)
        : null;
      const city = cityMatch?.[1]?.trim();
      const words = text.replace(/\b(what|show|tell me about|details|detail|capacity|verification|verified|status|of|for|the|ngo|ngos|organization|organizations|shelter|food bank|community kitchen|are|is|available|in|near|around)\b/gi, " ").trim();
      const ownOrganization = user.role === "NGO" && /\b(my|our)\b/i.test(text)
        ? await getUserNgo(user)
        : null;
      const namedMatch = ownOrganization || (!city && words.length >= 3
        ? await NGO.findOne({ ngoName: new RegExp(escapeRegex(words), "i"), isActive: { $ne: false } }).lean()
        : null);
      const organizations = namedMatch
        ? [namedMatch]
        : await NGO.find({
          ...(intent === "organizations" ? verifiedNgoFilter : { isActive: { $ne: false } }),
          ...(city ? { city: new RegExp(`^${escapeRegex(city)}$`, "i") } : {})
        })
          .sort({ ngoName: 1 }).limit(8).lean();
      reply = organizations.length
        ? `Organization records${city ? ` in ${city}` : ""}${namedMatch ? "" : ` (${organizations.length} shown)`}:\n${organizations.map((ngo) => {
          const status = ngo.verificationStatus || ngo.status || "not recorded";
          const capacity = ngo.dailyCapacity ?? ngo.capacity;
          const location = [ngo.city, ngo.state].filter(Boolean).join(", ") || "location not recorded";
          return `• ${ngo.ngoName} — ${ngo.organizationType || "type not recorded"}; ${location}; capacity ${capacity == null ? "not recorded" : `${capacity} meals/day`}; verification ${status}`;
        }).join("\n")}`
        : "No matching organization records were found.";
      suggestions = ["Nearest NGO", "Show available food donations", "How does AI matching work?"];
      quickActions = [{ label: "Open Organizations", action: "/organizations" }];
    } else if (intent === "nearest_organizations") {
      const latitude = Number(user.latitude);
      const longitude = Number(user.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (!latitude && !longitude)) {
        reply = "I can calculate nearby organizations only when your account has reliable latitude and longitude coordinates. Add your location to your account profile, then ask again.";
        quickActions = [{ label: "Open Dashboard", action: "/dashboard" }];
      } else {
        const organizations = await NGO.find({
          ...verifiedNgoFilter,
          latitude: { $ne: 0 },
          longitude: { $ne: 0 }
        }).lean();
        const nearest = organizations.map((ngo) => ({
          ngo,
          distance: haversineDistanceKm(latitude, longitude, ngo.latitude, ngo.longitude)
        })).sort((left, right) => left.distance - right.distance).slice(0, 5);
        reply = nearest.length
          ? `Nearest verified organizations by straight-line distance from your saved coordinates:\n${nearest.map(({ ngo, distance }) => `• ${ngo.ngoName} — ${distance.toFixed(1)} km; ${ngo.city || "location not recorded"}; capacity ${ngo.dailyCapacity ?? ngo.capacity ?? "not recorded"} meals/day`).join("\n")}\nThese are not road-route distances.`
          : "No verified organizations with usable coordinates are available to compare.";
        suggestions = ["Show organization verification status", "How does AI matching work?", "Browse organizations"];
        quickActions = [{ label: "Open Organizations", action: "/organizations" }];
      }
    } else if (intent === "operations" || intent === "deliveries") {
      const scope = await getOperationScope(user);
      if (!scope) {
        reply = "No operations are associated with this account role.";
      } else {
        const statusFilter = intent === "deliveries"
          ? { status: { $in: COMPLETED_OPERATION_STATUSES } }
          : { status: { $nin: COMPLETED_OPERATION_STATUSES.concat(["cancelled", "failed"]) } };
        const operations = await Operation.find({ ...scope, ...statusFilter })
          .populate("foodId", "foodName quantity quantityUnit address")
          .populate("ngoId", "ngoName")
          .populate("volunteerId", "name")
          .sort({ updatedAt: -1 }).limit(8).lean();
        reply = operations.length
          ? `${intent === "deliveries" ? "Completed deliveries and rescues" : "Your active rescue operations"} (${operations.length} shown):\n${operations.map(formatOperation).join("\n")}`
          : `No ${intent === "deliveries" ? "completed deliveries" : "active pickup assignments or operations"} were found for your account.`;
      }
      suggestions = intent === "deliveries"
        ? ["How much food have we rescued?", "Show my operations", "View rescue history"]
        : ["Show completed deliveries", "Show my pending claims", "How do I track a rescue?"];
      quickActions = [{ label: "Open Operations", action: "/operations" }];
    } else if (intent === "impact") {
      const scope = await getOperationScope(user);
      if (!scope) {
        reply = "There are no completed rescues associated with this account role.";
      } else {
        const totals = await Operation.aggregate([
          { $match: { ...scope, status: { $in: COMPLETED_OPERATION_STATUSES } } },
          { $lookup: { from: Food.collection.name, localField: "foodId", foreignField: "_id", as: "foodRecord" } },
          { $addFields: {
            rescuedQuantity: { $ifNull: ["$quantity", { $arrayElemAt: ["$foodRecord.quantity", 0] }] },
            quantityUnit: { $ifNull: [{ $arrayElemAt: ["$foodRecord.quantityUnit", 0] }, "meals"] }
          } },
          { $group: { _id: "$quantityUnit", quantity: { $sum: "$rescuedQuantity" }, rescues: { $sum: 1 } } }
        ]);
        reply = totals.length
          ? `Based on ${totals.reduce((sum, item) => sum + item.rescues, 0)} delivered or completed operation records, the stored rescued quantity totals ${totals.map((item) => `${item.quantity} ${item._id}`).join(", ")}. This sums each operation's recorded quantity (falling back to its linked food record); it is not an independently verified impact estimate.`
          : "No delivered or completed operations with recorded quantities were found in the records available to your account.";
      }
      suggestions = ["Show completed deliveries", "Show my donations", "How does AI matching work?"];
      quickActions = [{ label: "View Analytics", action: "/analytics" }];
    } else if (intent === "food_safety") {
      reply = "Use the donation form to record preparation and expiry times, storage conditions, packaging, and known allergens. Follow applicable local food-safety rules and your organization’s handling procedures; EcoShare records coordination details but does not inspect food or certify that a donation is safe.";
      suggestions = ["Which donations expire soon?", "Show available food donations", "How do I create a donation?"];
      quickActions = [{ label: "Open Donations", action: "/donations" }];
    } else if (intent === "matching") {
      reply = "The current matching code filters for verified, active organizations and scores candidates using food-category compatibility, refrigeration needs, distance or estimated route time, pickup radius, daily capacity, expiry urgency, operating hours, emergency pickup availability, and reliability. A separate Python Random Forest predictor can provide a claim-probability estimate; if that process times out or fails, the service uses a deterministic scoring fallback. EcoBot itself is a rule-based intent router, not a conversational language model.";
      suggestions = ["Show available food donations", "Show verified organizations", "Which donations expire soon?"];
      quickActions = [{ label: "Browse Donations", action: "/donations" }];
    } else {
      reply = "I don't have a grounded answer for that yet. I can explain EcoShare's architecture, matching rules, model and data limitations, roles, and rescue workflow, or look up records your signed-in role is authorized to access. Try one of the questions below; include a donation reference or NGO name for a specific record lookup.";
      suggestions = ["Explain the project architecture", "What data trains the model?", "What are the project limitations?", "Show my pending claims"];
      quickActions = [{ label: "Browse donations", action: "/donations" }, { label: "Open operations", action: "/operations" }];
    }

    return res.status(200).json(successResponse({
      intent,
      reply,
      suggestions,
      quickActions,
      timestamp: new Date()
    }, "EcoBot query processed"));
  } catch (error) {
    console.error("[EcoBot] Database query failed:", error.message);
    return res.status(500).json(errorResponse("EcoBot could not retrieve live records. Please retry in a moment.", "ECOBOT_QUERY_FAILED"));
  }
};

module.exports = {
  handleChatQuery,
  getFoodScope,
  getOperationScope,
  getClaimScope
};
