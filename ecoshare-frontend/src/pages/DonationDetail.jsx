import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDemoMode, demoDonations } = useDemo();

  const [food, setFood] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchFoodDetail();
  }, [id, isDemoMode]);

  const fetchFoodDetail = async () => {
    setLoading(true);
    if (isDemoMode) {
      const match = demoDonations.find(d => d._id === id) || demoDonations[0];
      setFood(match);
      setRecommendation({
        confidenceScore: 94,
        ngoName: "Robin Hood Army",
        pickupETA: 18,
        distanceKm: 2.8,
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
      if (res.data.data) {
        setFood(res.data.data.food);
        setRecommendation(res.data.data.recommendation);
        setTimeline(res.data.data.timeline || []);
      }
    } catch (err) {
      toast.error("Failed to load donation details");
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

  if (loading || !food) {
    return (
      <div className="eco-bg min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-xs text-slate-400">Loading donation details...</p>
        </div>
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

        {/* Header Summary */}
        <div className="bg-[#101D2D] border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`badge-status ${food.isEmergency ? "badge-emergency" : food.status === "Claimed" ? "badge-claimed" : "badge-available"}`}>
                {food.isEmergency ? "Emergency" : food.status}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Traceability ID: {food.traceabilityId || "ECO-2026-ACTIVE"}
              </span>
            </div>
            <h1 className="text-page-title">{food.foodName}</h1>
            <p className="text-body mt-1 flex items-center gap-2">
              <span>Donor: <strong className="text-white">{food.donorName}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> {food.address || food.location}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {food.status === "Available" ? (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="btn-primary"
              >
                {claiming ? "Claiming..." : "Claim Food & Schedule Pickup"}
              </button>
            ) : (
              <span className="badge-status badge-claimed text-xs py-2 px-3">
                <CheckCircle2 className="w-4 h-4" /> Claimed by {food.claimedBy || "NGO Partner"}
              </span>
            )}
          </div>
        </div>

        {/* Lifecycle Status Pipeline */}
        <StatusPipeline currentStatus={food.lifecycleState || food.status} />

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Specifications & Route */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Food Specifications */}
            <div className="stat-card space-y-4">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" /> Food Safety & Storage Specs
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Category</span>
                  <p className="text-xs font-semibold text-white mt-0.5 capitalize">{food.category || "Cooked Meals"}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Storage</span>
                  <p className="text-xs font-semibold text-blue-400 mt-0.5 capitalize">{food.storageCondition || "Ambient"}</p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Safety Verification</span>
                  <p className="text-xs font-semibold text-green-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                  </p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Prepared</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {food.cookedTime ? new Date(food.cookedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"}
                  </p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Expires</span>
                  <p className="text-xs font-semibold text-amber-400 mt-0.5">
                    {new Date(food.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Quantity</span>
                  <p className="text-xs font-semibold text-blue-400 mt-0.5">{food.quantity} Portions</p>
                </div>
              </div>

              {food.notes && (
                <div className="p-3 bg-[#07111F] border border-slate-800 rounded-xl text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-0.5">Special Instructions:</strong>
                  {food.notes}
                </div>
              )}
            </div>

            {/* Map */}
            <DashboardMap foods={[food]} selectedFood={food} heightClass="h-[360px]" />

            {/* Audit History */}
            <div className="stat-card space-y-3">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Audit Log
              </h3>
              <div className="space-y-3 pt-2">
                {timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-b border-slate-800/60 pb-3 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">{event.details}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {event.performedByName || "System"} • {new Date(event.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Match */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Recipient Compatibility</h3>
              <MatchScoreCard recommendation={recommendation || food.recommendation} />
            </div>

            <div className="bg-[#101D2D] border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Traceability Fingerprint</h4>
                  <p className="text-[11px] text-slate-400">Food chain authenticity record</p>
                </div>
              </div>

              <div className="p-3 bg-[#07111F] rounded-xl border border-slate-800 text-center">
                <p className="text-xs font-mono font-semibold text-blue-400">{food.traceabilityId || "ECO-2026-981023"}</p>
              </div>

              <a
                href={`/history?trace=${food.traceabilityId}`}
                className="w-full btn-secondary text-xs justify-center no-underline py-2"
              >
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
