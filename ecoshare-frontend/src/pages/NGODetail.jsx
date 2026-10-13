import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import DashboardMap from "../components/DashboardMap";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, ShieldCheck, MapPin, Phone, Building2, Mail, Users } from "lucide-react";

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
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    fetchNgoDetail();
  }, [id, isDemoMode]);

  const fetchNgoDetail = async () => {
    setLoading(true);
    setError("");
    setNotFound(false);
    setNgo(null);

    if (isDemoMode) {
      const match = demoNgos.find((n) => String(n._id) === String(id));
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
      const res = await api.get(`/api/ngo/${id}`);
      const detail = res.data?.data ?? res.data;
      if (!detail) {
        setNgo(null);
        setNotFound(true);
        setError("Organization not found.");
        return;
      }
      setNgo(detail);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      setNgo(null);
      setNotFound(status === 404);
      setError(status === 404 ? "Organization not found." : err?.message || "Unable to load organization profile. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar>
          <main className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[var(--text-secondary)]">
            <div className="spinner mx-auto mb-3 h-6 w-6" role="status" aria-label="Loading organization profile" />
            Loading organization profile...
          </main>
        </Navbar>
      </div>
    );
  }

  if (error || notFound || !ngo) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar>
          <main className="page-container">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto shadow-[var(--shadow)]">
              <h1 className="text-page-title">{notFound ? "Organization not found" : "Unable to load organization profile"}</h1>
              <p className="text-body">{error || "The organization profile could not be found."}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={fetchNgoDetail} className="btn-secondary" type="button">Retry</button>
                <button onClick={() => navigate("/organizations")} className="btn-primary" type="button">Return to organizations</button>
              </div>
            </div>
          </main>
        </Navbar>
      </div>
    );
  }

  const organizationType = formatValue(ngo.organizationType || ngo.type || "ngo");
  const statusLabel = formatValue(ngo.verificationStatus || ngo.status || "pending");
  const isVerified = ["verified", "approved"].includes(String(statusLabel).toLowerCase());
  const capacity = formatValue(ngo.dailyCapacity ?? ngo.capacity ?? 0, 0);
  const contactEmail = formatValue(ngo.email || "Not available");
  const contactPhone = formatValue(ngo.phone || "Not available");
  const acceptedCategories = Array.isArray(ngo.foodCategoriesAccepted) && ngo.foodCategoriesAccepted.length ? ngo.foodCategoriesAccepted.join(", ") : "Not recorded";
  const fullAddress = [ngo.address, ngo.city, ngo.state, ngo.pincode].filter(Boolean).join(", ");

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[var(--shadow)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center text-[#031712] shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge-status ${isVerified ? "badge-available" : "badge-pending"}`}>
                  <ShieldCheck className="w-3.5 h-3.5" /> {isVerified ? "Verified Partner Organization" : String(statusLabel).replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-page-title">{ngo.ngoName}</h1>
              <p className="text-body mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" /> {formatValue(fullAddress || ngo.location || "Location not provided")}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-right">
            <span className="text-meta font-medium block text-[var(--text-secondary)]">Daily Meal Capacity</span>
            <span className="text-xl font-bold text-[var(--success)]">{capacity} Servings</span>
          </div>
        </div>

        <div className="flex border-b border-[var(--border)] gap-6 text-xs font-semibold">
          {["overview", "capacity", "operations", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize cursor-pointer ${
                activeTab === tab ? "text-[var(--primary)] border-b-2 border-[var(--primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-4 shadow-[var(--shadow)]">
                <h3 className="text-section-title text-base">Contact & Logistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-start gap-2"><Building2 className="w-4 h-4 text-[var(--primary)] mt-0.5" /> <div>Organization type: <strong className="text-[var(--text)] block mt-0.5">{String(organizationType).replace(/_/g, " ")}</strong></div></div>
                  <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-[var(--primary)] mt-0.5" /> <div>Phone: <strong className="text-[var(--text)] block mt-0.5">{contactPhone}</strong></div></div>
                  <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-[var(--primary)] mt-0.5" /> <div>Email: <strong className="text-[var(--text)] block mt-0.5 break-all">{contactEmail}</strong></div></div>
                  <div className="flex items-start gap-2"><Users className="w-4 h-4 text-[var(--primary)] mt-0.5" /> <div>Contact person: <strong className="text-[var(--text)] block mt-0.5">{formatValue(ngo.contactPerson || "Not assigned")}</strong></div></div>
                </div>
              </div>

              <DashboardMap ngos={[ngo]} heightClass="h-[360px]" />
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-3 shadow-[var(--shadow)]">
              <h3 className="text-section-title text-base">Organization Status</h3>
              <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                <div>Registration Number: <span className="font-mono text-[var(--text)] block mt-0.5">{formatValue(ngo.registrationNumber || ngo.registrationId || "Not available")}</span></div>
                <div>Status: <span className={`font-semibold block mt-0.5 capitalize ${isVerified ? "text-[var(--success)]" : "text-amber-600"}`}>{String(statusLabel).replace(/_/g, " ")}</span></div>
                <div>Food categories accepted: <span className="text-[var(--text)] font-semibold block mt-0.5">{acceptedCategories}</span></div>
                <div>Refrigeration: <span className="text-[var(--text)] font-semibold block mt-0.5">{ngo.hasRefrigeration || ngo.refrigerationAvailable ? "Available" : "Not available"}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "capacity" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-3 shadow-[var(--shadow)]">
            <h2 className="text-section-title">Recorded capacity and handling</h2>
            <dl className="grid grid-cols-1 gap-4 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
              <div><dt>Daily capacity</dt><dd className="mt-1 font-semibold text-[var(--text)]">{capacity} meals/day</dd></div>
              <div><dt>Accepted food categories</dt><dd className="mt-1 font-semibold text-[var(--text)]">{acceptedCategories}</dd></div>
              <div><dt>Refrigeration</dt><dd className="mt-1 font-semibold text-[var(--text)]">{ngo.hasRefrigeration === true ? "Available" : ngo.hasRefrigeration === false ? "Not available" : "Not recorded"}</dd></div>
              <div><dt>Pickup radius</dt><dd className="mt-1 font-semibold text-[var(--text)]">{ngo.pickupRadius == null ? "Not recorded" : `${ngo.pickupRadius} km`}</dd></div>
              <div><dt>Emergency pickup</dt><dd className="mt-1 font-semibold text-[var(--text)]">{ngo.emergencyPickupAvailable == null ? "Not recorded" : ngo.emergencyPickupAvailable ? "Available" : "Not available"}</dd></div>
            </dl>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center text-sm text-[var(--text-secondary)] shadow-[var(--shadow)]">
            Organization operations are available in the Operations workspace after sign-in.
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center text-sm text-[var(--text-secondary)] shadow-[var(--shadow)]">
            This profile endpoint does not provide an organization activity feed.
          </div>
        )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
