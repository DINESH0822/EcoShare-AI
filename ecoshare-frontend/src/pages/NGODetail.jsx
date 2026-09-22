import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import DashboardMap from "../components/DashboardMap";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, ShieldCheck, MapPin, Phone, Building2, Mail, Users } from "lucide-react";
import toast from "react-hot-toast";

const formatValue = (value, fallback = "Not available") => {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
};

export default function NGODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode, demoNgos } = useDemo();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchNgoDetail();
  }, [id, isDemoMode]);

  const fetchNgoDetail = async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    if (isDemoMode) {
      const match = demoNgos.find((n) => n._id === id) || demoNgos[0];
      if (!match) {
        setNgo(null);
        setNotFound(true);
        setLoading(false);
        return;
      }
      setNgo(match);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/ngo/${id}`);
      const detail = res.data?.data ?? res.data;
      if (!detail) {
        setNgo(null);
        setNotFound(true);
        return;
      }
      setNgo(detail);
    } catch (err) {
      const status = err?.response?.status;
      setNgo(null);
      setNotFound(status === 404);
      setError(status === 404 ? "Organization not found." : "Unable to load organization profile.");
      if (status !== 404) {
        toast.error("Unable to load organization profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="eco-bg min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#94A3B8]">
          Loading organization profile...
        </div>
      </div>
    );
  }

  if (error || notFound || !ngo) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar />
        <main className="page-container">
          <div className="bg-[#101D2D] border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
            <h1 className="text-page-title">{notFound ? "Organization not found" : "Unable to load organization profile"}</h1>
            <p className="text-body">{error || "The organization profile you are trying to open is missing or the server could not return it."}</p>
            <button onClick={() => navigate("/organizations")} className="btn-primary">Return to organizations</button>
          </div>
        </main>
      </div>
    );
  }

  const organizationType = formatValue(ngo.organizationType || ngo.type || "ngo");
  const statusLabel = formatValue(ngo.verificationStatus || ngo.status || "verified");
  const capacity = formatValue(ngo.dailyCapacity || ngo.capacity || 0, 0);
  const contactEmail = formatValue(ngo.email || "Not available");
  const contactPhone = formatValue(ngo.phone || "Not available");
  const acceptedCategories = Array.isArray(ngo.foodCategoriesAccepted) && ngo.foodCategoriesAccepted.length ? ngo.foodCategoriesAccepted.join(", ") : "Mixed / flexible";

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
                <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" /> {formatValue(ngo.address || ngo.city || "Location not provided")}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#07111F] border border-[#1E3045] rounded-lg text-right">
            <span className="text-meta font-medium block">Daily Meal Capacity</span>
            <span className="text-xl font-bold text-[#22C55E]">{capacity} Servings</span>
          </div>
        </div>

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

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-4">
                <h3 className="text-section-title text-base">Contact & Logistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#94A3B8]">
                  <div className="flex items-start gap-2"><Building2 className="w-4 h-4 text-[#3B82F6] mt-0.5" /> <div>Organization type: <strong className="text-white block mt-0.5">{String(organizationType).replace(/_/g, " ")}</strong></div></div>
                  <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-[#3B82F6] mt-0.5" /> <div>Phone: <strong className="text-white block mt-0.5">{contactPhone}</strong></div></div>
                  <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-[#3B82F6] mt-0.5" /> <div>Email: <strong className="text-white block mt-0.5 break-all">{contactEmail}</strong></div></div>
                  <div className="flex items-start gap-2"><Users className="w-4 h-4 text-[#3B82F6] mt-0.5" /> <div>Contact person: <strong className="text-white block mt-0.5">{formatValue(ngo.contactPerson || "Not assigned")}</strong></div></div>
                </div>
              </div>

              <DashboardMap ngos={[ngo]} heightClass="h-[360px]" />
            </div>

            <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-3">
              <h3 className="text-section-title text-base">Organization Status</h3>
              <div className="space-y-2 text-xs text-[#94A3B8]">
                <div>Registration Number: <span className="font-mono text-white block mt-0.5">{formatValue(ngo.registrationNumber || ngo.registrationId || "Not available")}</span></div>
                <div>Status: <span className="text-[#22C55E] font-semibold block mt-0.5 capitalize">{String(statusLabel).replace(/_/g, " ")}</span></div>
                <div>Food categories accepted: <span className="text-white font-semibold block mt-0.5">{acceptedCategories}</span></div>
                <div>Refrigeration: <span className="text-white font-semibold block mt-0.5">{ngo.hasRefrigeration || ngo.refrigerationAvailable ? "Available" : "Not available"}</span></div>
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
