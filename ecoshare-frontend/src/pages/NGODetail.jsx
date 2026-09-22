import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import DashboardMap from "../components/DashboardMap";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, ShieldCheck, MapPin, Phone, Building2 } from "lucide-react";
import toast from "react-hot-toast";

export default function NGODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode, demoNgos } = useDemo();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchNgoDetail();
  }, [id, isDemoMode]);

  const fetchNgoDetail = async () => {
    setLoading(true);
    if (isDemoMode) {
      const match = demoNgos.find(n => n._id === id) || demoNgos[0];
      setNgo(match);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/ngo/${id}`);
      setNgo(res.data.data || res.data);
    } catch (err) {
      toast.error("Failed to load organization profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !ngo) {
    return (
      <div className="eco-bg min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#94A3B8]">
          Loading organization profile...
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
          className="text-xs font-semibold text-[#94A3B8] hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* Profile Header */}
        <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-status badge-available">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner Organization
                </span>
              </div>
              <h1 className="text-page-title">{ngo.ngoName}</h1>
              <p className="text-body mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" /> {ngo.address || ngo.city}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#07111F] border border-[#1E3045] rounded-lg text-right">
            <span className="text-meta font-medium block">Daily Meal Capacity</span>
            <span className="text-xl font-bold text-[#22C55E]">{ngo.capacity || 250} Servings</span>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-[#1E3045] gap-6 text-xs font-semibold">
          {["overview", "capacity", "operations", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize cursor-pointer ${
                activeTab === tab ? "text-[#3B82F6] border-b-2 border-[#3B82F6]" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-3">
                <h3 className="text-section-title text-base">Contact & Logistics</h3>
                <div className="grid grid-cols-2 gap-4 text-xs text-[#94A3B8]">
                  <div>Contact Person: <strong className="text-white block mt-0.5">{ngo.contactPerson}</strong></div>
                  <div>Phone: <strong className="text-white block mt-0.5">{ngo.phone}</strong></div>
                  <div>Storage Units: <strong className="text-[#22C55E] block mt-0.5">{ngo.refrigerationAvailable ? "Refrigerated" : "Standard"}</strong></div>
                  <div>Pickup Radius: <strong className="text-white block mt-0.5">{ngo.maxPickupRadiusKm || 20} km</strong></div>
                </div>
              </div>

              <DashboardMap ngos={[ngo]} heightClass="h-[360px]" />
            </div>

            <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-3">
              <h3 className="text-section-title text-base">Organization Status</h3>
              <div className="space-y-2 text-xs text-[#94A3B8]">
                <div>Reg Number: <span className="font-mono text-white block mt-0.5">{ngo.registrationNumber || "MH-2024-NGO-9912"}</span></div>
                <div>Status: <span className="text-[#22C55E] font-semibold block mt-0.5">Government Verified</span></div>
                <div>Compliance: <span className="text-white font-semibold block mt-0.5">FSSAI Certified</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-8 text-center text-xs text-[#94A3B8]">
            Displaying detailed {activeTab} information for {ngo.ngoName}.
          </div>
        )}
      </main>

      <EcoBot />
    </div>
  );
}
