import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../config/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Clock, MapPin, Truck, ShieldAlert, Trash2, Brain, AlertCircle, Calendar, Sparkles } from "lucide-react";

function FoodTable({ onSelectFood = null }) {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters and search state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [distanceFilter, setDistanceFilter] = useState("All");
  const [qtyFilter, setQtyFilter] = useState("All");

  const [claiming, setClaiming] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const { user, API_BASE, getAuthHeaders } = useAuth();
  const userRole = user?.role;

  const fetchEcosystemData = async () => {
    try {
      const [foodRes, ngoRes] = await Promise.all([
        axios.get(`${API_BASE}/api/food`, getAuthHeaders()),
        axios.get(`${API_BASE}/api/ngo`, getAuthHeaders())
      ]);
      setFoods(foodRes.data);
      setNgos(ngoRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcosystemData();
  }, [user]);

  const handleClaimFood = async (foodId, recNgoId, recNgoName) => {
    setClaiming(foodId);
    const ngoName = userRole === "NGO" ? user.name : (recNgoName || "Helping Hands NGO");
    const matchedNgo = ngos.find(n => n.ngoName === ngoName || n._id === recNgoId);

    try {
      await axios.post(`${API_BASE}/api/claim`, {
        foodId,
        ngoName: matchedNgo ? matchedNgo.ngoName : ngoName,
        ngoId: matchedNgo ? matchedNgo._id : recNgoId
      }, getAuthHeaders());

      toast.success(`Food successfully claimed by ${ngoName}!`);
      
      setFoods(prev =>
        prev.map(f => f._id === foodId ? { ...f, status: "Claimed", claimedBy: ngoName, claimedByNgoId: matchedNgo?._id } : f)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim food");
    } finally {
      setClaiming(null);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this donation from the platform?")) return;
    setDeleting(foodId);
    try {
      await axios.delete(`${API_BASE}/api/food/${foodId}`, getAuthHeaders());
      toast.success("Food donation deleted successfully");
      setFoods(prev => prev.filter(f => f._id !== foodId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete donation");
    } finally {
      setDeleting(null);
    }
  };

  // Filter & Search computation
  const filteredFoods = foods.filter((food) => {
    const isExpired = new Date(food.expiryTime) < new Date();
    const query = search.toLowerCase();
    const matchesSearch = (
      food.foodName?.toLowerCase().includes(query) ||
      food.donorName?.toLowerCase().includes(query) ||
      food.city?.toLowerCase().includes(query) ||
      food.address?.toLowerCase().includes(query)
    );
    if (!matchesSearch) return false;

    if (statusFilter !== "All") {
      if (statusFilter === "Claimed" && food.status !== "Claimed") return false;
      if (statusFilter === "Expired" && (!isExpired || food.status === "Claimed")) return false;
      if (statusFilter === "Available" && (food.status === "Claimed" || isExpired)) return false;
    }

    if (typeFilter !== "All") {
      if (typeFilter === "Business" && food.donorType === "Individual") return false;
      if (typeFilter === "Individual" && food.donorType !== "Individual") return false;
    }

    if (qtyFilter !== "All") {
      const q = food.quantity || 0;
      if (qtyFilter === "Small" && q >= 20) return false;
      if (qtyFilter === "Medium" && (q < 20 || q > 80)) return false;
      if (qtyFilter === "Large" && q <= 80) return false;
    }

    if (distanceFilter !== "All" && food.recommendation) {
      const d = food.recommendation.distance || 0;
      if (distanceFilter === "Close" && d >= 5) return false;
      if (distanceFilter === "Medium" && (d < 5 || d > 15)) return false;
      if (distanceFilter === "Far" && d <= 15) return false;
    }

    return true;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            🍱 Surplus Food Registry
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Browse and filter active food matches based on your location and demands.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {["All", "Available", "Claimed", "Expired"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === s
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search food name, donor, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eco-input pl-10 text-xs py-3"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="eco-input py-2 px-3 text-xs w-full cursor-pointer bg-white"
          >
            <option value="All">All Donors</option>
            <option value="Individual">Individuals</option>
            <option value="Business">Businesses/Hotels</option>
          </select>

          <select
            value={qtyFilter}
            onChange={(e) => setQtyFilter(e.target.value)}
            className="eco-input py-2 px-3 text-xs w-full cursor-pointer bg-white"
          >
            <option value="All">All Sizes</option>
            <option value="Small">Small (&lt;20 meals)</option>
            <option value="Medium">Medium (20-80)</option>
            <option value="Large">Large (&gt;80)</option>
          </select>

          <select
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
            className="eco-input py-2 px-3 text-xs w-full cursor-pointer bg-white"
          >
            <option value="All">All Distances</option>
            <option value="Close">Close (&lt;5 km)</option>
            <option value="Medium">Medium (5-15 km)</option>
            <option value="Far">Far (&gt;15 km)</option>
          </select>
        </div>
      </div>

      {/* Grid of Food Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="spinner" />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center text-slate-400 text-sm font-semibold shadow-sm">
          No food donations found matching your selected criteria.
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredFoods.map((food) => {
              const isExpired = new Date(food.expiryTime) < new Date();
              const rec = food.recommendation;

              return (
                <motion.div
                  key={food._id}
                  variants={cardVariants}
                  layout
                  className="food-card flex flex-col justify-between"
                  whileHover={{ y: -3 }}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        food.status === "Claimed"
                          ? "bg-amber-50 border border-amber-200/50 text-amber-700"
                          : isExpired
                          ? "bg-red-50 border border-red-200/50 text-red-700"
                          : "bg-emerald-50 border border-emerald-200/50 text-emerald-700"
                      }`}>
                        {food.status === "Claimed" ? `Claimed by ${food.claimedBy}` : isExpired ? "Expired" : "Available"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(food.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-4 tracking-tight">
                      {food.foodName}
                    </h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        👤 <span className="font-semibold text-slate-800">{food.donorName}</span> ({food.donorType})
                      </span>
                      <span className="flex items-center gap-1.5">
                        🍽️ <span className="font-bold text-slate-800">{food.quantity}</span> servings
                      </span>
                      <span className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50/50 px-2 py-0.5 rounded-md">
                        <Clock className="w-3.5 h-3.5" /> Exp: {new Date(food.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-4 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{food.address || food.location}</span>
                    </p>

                    {/* AI Recommendation Engine card */}
                    {rec && (
                      <div className="mt-5 p-4 bg-blue-50/40 border border-blue-100/50 rounded-xl space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full pointer-events-none" />
                        <div className="flex items-center justify-between">
                          <span className="ai-badge flex items-center gap-1 bg-blue-50/80">
                            <Brain className="w-3 h-3 text-blue-600" /> AI Recommendation
                          </span>
                          <span className="text-xs font-bold text-blue-700 bg-blue-100/50 px-2.5 py-0.5 rounded-full">
                            {rec.confidenceScore}% match
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                          <div>
                            NGO: <span className="font-bold text-slate-900 ml-1">{rec.ngoName}</span>
                          </div>
                          <div>
                            Distance: <span className="font-bold text-slate-900 ml-1">{rec.distance} km</span>
                          </div>
                          <div>
                            ETA: <span className="font-bold text-slate-900 ml-1">{rec.pickupETA} mins</span>
                          </div>
                          <div>
                            Capacity: <span className="font-bold text-slate-900 ml-1">{rec.capacityAvailable} meals</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed bg-white border border-slate-100 px-3 py-2 rounded-lg mt-2 flex items-start gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span><strong>Reasoning:</strong> {rec.reason}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Button Actions */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => onSelectFood && onSelectFood(food)}
                      className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" /> View Route
                    </button>

                    {food.status === "Available" && !isExpired && (userRole === "NGO" || userRole === "Admin") && (
                      <button
                        onClick={() => handleClaimFood(food._id, rec?.recommendedNgoId, rec?.ngoName)}
                        disabled={claiming === food._id}
                        className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer bg-slate-900"
                      >
                        {claiming === food._id ? (
                          <div className="spinner w-3.5 h-3.5 border border-slate-300 border-t-white" />
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Claim Food
                          </>
                        )}
                      </button>
                    )}

                    {(userRole === "Admin" || (userRole === "Donor" && user?._id === food.donorId)) && (
                      <button
                        onClick={() => handleDeleteFood(food._id)}
                        disabled={deleting === food._id}
                        className="p-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"
                        title="Delete Donation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default FoodTable;