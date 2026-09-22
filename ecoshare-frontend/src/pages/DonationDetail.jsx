import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import StatusPipeline from "../components/StatusPipeline";
import MatchScoreCard from "../components/MatchScoreCard";
import EcoBot from "../components/EcoBot";
import DashboardMap from "../components/DashboardMap";
import { useAuth } from "../config/AuthContext";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, ShieldCheck, MapPin, Clock, CheckCircle2, QrCode, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
};

const getFoodValue = (food, keys) => {
  for (const key of keys) {
    if (food?.[key] !== undefined && food?.[key] !== null && food?.[key] !== "") {
      return food[key];
    }
  }
  return null;
};

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode, demoDonations } = useDemo();

  const [food, setFood] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchFoodDetail();
  }, [id, isDemoMode]);

  const fetchFoodDetail = async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    if (isDemoMode) {
      const match = demoDonations.find((d) => d._id === id || d.traceabilityId === id) || null;

      if (!match) {
        setFood(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setFood(match);
      setRecommendation({
        confidenceScore: 94,
        ngoName: "Robin Hood Army",
        pickupETA: 18,
        distance: 2.8,
        reasons: [
          "Capacity fit for 120 cooked servings",
          "Refrigerated storage unit ready",
          "Route ETA under 20 minutes"
        ]
      });
      setTimeline([
        { action: "published", details: "Donation published to network", createdAt: new Date().toISOString() },
        { action: "ai_recommended", details: "AI matched Robin Hood Army with 94% confidence score", createdAt: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/food/${id}`);
      const payload = res.data?.data ?? res.data;
      const detail = payload?.food ?? payload;

      if (!detail) {
        setFood(null);
        setNotFound(true);
        return;
      }

      setFood(detail);
      setRecommendation(payload?.recommendation ?? detail.recommendation ?? null);
      setTimeline(payload?.timeline ?? detail.timeline ?? []);
    } catch (err) {
      const status = err?.response?.status;
      setFood(null);
      setNotFound(status === 404);
      setError(status === 404 ? "Donation not found." : "Unable to load donation details.");
      if (status !== 404) {
        toast.error("Unable to load donation details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await axios.post("/api/claim", {
        foodId: food._id,
        ngoName: user?.name || "Partner NGO"
      });
      toast.success("Food donation claimed successfully!");
      fetchFoodDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim donation");
    } finally {
      setClaiming(false);
    }
  };

  const donorPhone = getFoodValue(food, ["donorPhone", "phone", "donor.phone", "contactNumber"]) || "Not available";
  const donorEmail = getFoodValue(food, ["donorEmail", "email", "donor.email"]) || "Not available";
  const donorLocation = [getFoodValue(food, ["donorAddress", "address", "location"]), getFoodValue(food, ["city"]), getFoodValue(food, ["state"])].filter(Boolean).join(", ") || "Not available";
  const category = getFoodValue(food, ["foodCategory", "category", "foodType"]) || "Cooked meals";
  const storage = getFoodValue(food, ["storageTemperature", "storageCondition", "storageType"]) || (food?.requiresRefrigeration ? "Refrigeration required" : "Ambient");
  const unitLabel = getFoodValue(food, ["quantityUnit", "unit"]) || "servings";
  const description = getFoodValue(food, ["description", "notes", "foodDescription"]) || "No description provided.";
  const preparedAt = getFoodValue(food, ["preparedAt", "cookedTime", "createdAt"]) || null;
  const pickupWindow = [getFoodValue(food, ["pickupWindowStart", "pickupStart"]), getFoodValue(food, ["pickupWindowEnd", "pickupEnd"])].filter(Boolean);

  if (loading) {
    return (
      <div className="eco-bg min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-xs text-slate-400">Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (error || notFound || !food) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar />
        <main className="page-container">
          <div className="bg-[#101D2D] border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
            <h1 className="text-page-title">{notFound ? "Donation not found" : "Unable to load donation details"}</h1>
            <p className="text-body">{error || "The donation you are trying to open is missing or the server could not return it."}</p>
            <button onClick={() => navigate("/donations")} className="btn-primary">Return to donations</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar />

      <main className="page-container space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        <div className="bg-[#101D2D] border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`badge-status ${food.isEmergency ? "badge-emergency" : food.status === "Claimed" || food.status === "claimed" ? "badge-claimed" : "badge-available"}`}>
                {food.isEmergency ? "Emergency" : food.status || "Available"}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Traceability ID: {food.traceabilityId || food.traceId || "ECO-2026-ACTIVE"}
              </span>
            </div>
            <h1 className="text-page-title">{food.foodName || "Unnamed donation"}</h1>
            <p className="text-body mt-1 flex items-center gap-2">
              <span>Donor: <strong className="text-white">{food.donorName || "Unknown donor"}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> {donorLocation}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {food.status === "Available" || food.status === "available" ? (
              <button onClick={handleClaim} disabled={claiming} className="btn-primary">
                {claiming ? "Claiming..." : "Claim Food & Schedule Pickup"}
              </button>
            ) : (
              <span className="badge-status badge-claimed text-xs py-2 px-3">
                <CheckCircle2 className="w-4 h-4" /> Claimed by {food.claimedBy || recommendation?.ngoName || "NGO Partner"}
              </span>
            )}
          </div>
        </div>

        <StatusPipeline currentStatus={food.lifecycleState || food.status || "published"} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="stat-card space-y-4">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" /> Food Information
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Food type</span>
                  <p className="text-xs font-semibold text-white mt-0.5 capitalize">{String(category).replace(/_/g, " ")}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Quantity</span>
                  <p className="text-xs font-semibold text-blue-400 mt-0.5">{food.quantity || 0} {unitLabel}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Storage / condition</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5 capitalize">{String(storage).replace(/_/g, " ")}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Prepared</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">{formatDate(preparedAt)}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Expiry</span>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">{formatDate(food.expiryTime)}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Vegetarian</span>
                  <p className="text-xs font-semibold text-green-400 mt-0.5">{food.isVegetarian === false ? "No" : "Yes"}</p>
                </div>
              </div>

              <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl text-xs text-slate-300">
                <strong className="text-slate-400 block mb-0.5">Description:</strong>
                {description}
              </div>

              {pickupWindow.length > 0 && (
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-1">Pickup window:</strong>
                  {pickupWindow.map((time) => formatDate(time)).join(" → ")}
                </div>
              )}
            </div>

            <DashboardMap foods={[food]} selectedFood={food} heightClass="h-[360px]" />

            <div className="stat-card space-y-3">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Audit Log
              </h3>
              <div className="space-y-3 pt-2">
                {(timeline.length ? timeline : [{ details: "Donation published to the network", createdAt: new Date().toISOString() }]).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-b border-slate-800/60 pb-3 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">{event.details || "Donation activity recorded"}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {event.performedByName || "System"} • {formatDate(event.createdAt || Date.now())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Recipient Compatibility</h3>
              <MatchScoreCard recommendation={recommendation || { confidenceScore: 0, ngoName: "Awaiting match" }} />
            </div>

            <div className="bg-[#101D2D] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Donation details</h4>
                  <p className="text-[11px] text-slate-400">Operational record</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between gap-4"><span className="text-slate-400">Donation ID</span><span className="font-semibold text-white">{food._id || food.traceabilityId || "N/A"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Created</span><span className="font-semibold text-white">{formatDate(food.createdAt)}</span></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Status</span><span className="font-semibold text-white">{food.status || "Available"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Donor</span><span className="font-semibold text-white">{food.donorName || "Unknown donor"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Phone</span><span className="font-semibold text-white">{donorPhone}</span></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Email</span><span className="font-semibold text-white">{donorEmail}</span></div>
              </div>

              <a href={`/history?trace=${food.traceabilityId || food.traceId || food._id}`} className="w-full btn-secondary text-xs justify-center no-underline py-2">
                Open Audit Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <EcoBot />
    </div>
  );
}
