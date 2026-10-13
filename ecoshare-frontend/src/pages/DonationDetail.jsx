import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
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
    const value = key.split(".").reduce((current, part) => current?.[part], food);
    if (value !== undefined && value !== null && value !== "") {
      return value;
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
      const res = await api.get(`/api/food/${id}`);
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
      const status = err?.status || err?.response?.status;
      setFood(null);
      setNotFound(status === 404);
      setError(
        status === 404
          ? "Donation not found."
          : err?.response?.data?.message || err?.message || "Unable to load donation details. Check your connection and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await api.post("/api/claim", {
        foodId: food._id
      });
      toast.success("Food donation claimed successfully!");
      fetchFoodDetail();
    } catch (err) {
      toast.error(err?.message || "Failed to claim donation");
    } finally {
      setClaiming(false);
    }
  };

  const donorPhone = getFoodValue(food, ["donorPhone", "phone", "donorId.phone", "contactNumber"]) || "Not available";
  const donorEmail = getFoodValue(food, ["donorEmail", "email", "donorId.email"]) || "Not available";
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
        <DemoModeBanner />
        <Navbar>
          <main className="mx-auto max-w-4xl px-4 py-20 text-center">
            <p className="text-xs text-[var(--text-secondary)]">Loading donation details...</p>
          </main>
        </Navbar>
      </div>
    );
  }

  if (error || notFound || !food) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar>
          <main className="page-container">
            <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[var(--border)] bg-white/85 p-8 text-center shadow-[var(--shadow)] backdrop-blur-sm">
              <h1 className="text-page-title">{notFound ? "Donation not found" : "Unable to load donation details"}</h1>
              <p className="text-body">{error || "The donation you are trying to open is missing or the server could not return it."}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {!notFound && <button onClick={fetchFoodDetail} className="btn-secondary" type="button">Retry</button>}
                <button onClick={() => navigate("/donations")} className="btn-primary" type="button">Return to donations</button>
              </div>
            </div>
          </main>
        </Navbar>
      </div>
    );
  }

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container min-w-0 space-y-6">
        <button onClick={() => navigate(-1)} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)]">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </button>

        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-[var(--border)] bg-white/85 p-6 shadow-[var(--shadow)] backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className={`badge-status ${food.isEmergency ? "badge-emergency" : food.status === "Claimed" || food.status === "claimed" ? "badge-claimed" : "badge-available"}`}>
                {food.isEmergency ? "Emergency" : food.status || "Available"}
              </span>
              <span className="break-all font-mono text-xs text-[var(--text-secondary)]">
                Traceability ID: {food.traceabilityId || food.traceId || "ECO-2026-ACTIVE"}
              </span>
            </div>
            <h1 className="break-words text-page-title">{food.foodName || "Unnamed donation"}</h1>
            <p className="mt-1 flex flex-wrap items-start gap-x-2 gap-y-1 text-body">
              <span>Donor: <strong className="text-[var(--text)]">{food.donorName || "Unknown donor"}</strong></span>
              <span>•</span>
              <span className="flex min-w-0 items-start gap-1 break-words text-[var(--text-secondary)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" /> {donorLocation}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {food.status === "Available" || food.status === "available" ? (
              user?.role === "NGO" ? (
                <button onClick={handleClaim} disabled={claiming} className="btn-primary">
                  {claiming ? "Claiming..." : "Claim Food & Schedule Pickup"}
                </button>
              ) : (
                <p className="max-w-xs text-xs text-[var(--text-secondary)] sm:text-right">
                  Only verified NGO accounts can claim donations.{" "}
                  <Link to="/ngo/login" className="font-semibold text-[var(--primary)] hover:underline">
                    Sign in as an NGO
                  </Link>
                </p>
              )
            ) : (
              <span className="badge-status badge-claimed px-3 py-2 text-xs">
                <CheckCircle2 className="h-4 w-4" /> Claimed by {food.claimedBy || recommendation?.ngoName || "NGO Partner"}
              </span>
            )}
          </div>
        </div>

        <StatusPipeline currentStatus={food.lifecycleState || food.status || "published"} />

        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <div className="stat-card space-y-4">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" /> Food Information
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Food type</span>
                  <p className="mt-0.5 text-xs font-semibold capitalize text-[var(--text)]">{String(category).replace(/_/g, " ")}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Quantity</span>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--primary)]">{food.quantity || 0} {unitLabel}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Storage / condition</span>
                  <p className="mt-0.5 text-xs font-semibold capitalize text-[var(--text)]">{String(storage).replace(/_/g, " ")}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Prepared</span>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--text)]">{formatDate(preparedAt)}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Expiry</span>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--warning)]">{formatDate(food.expiryTime)}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <span className="block text-[11px] font-medium text-[var(--text-secondary)]">Vegetarian</span>
                  <p className="mt-0.5 text-xs font-semibold text-[var(--success)]">{food.isVegetarian === false ? "No" : "Yes"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text)]">
                <strong className="mb-0.5 block text-[var(--text-secondary)]">Description:</strong>
                {description}
              </div>

              {pickupWindow.length > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text)]">
                  <strong className="mb-1 block text-[var(--text-secondary)]">Pickup window:</strong>
                  {pickupWindow.map((time) => formatDate(time)).join(" → ")}
                </div>
              )}
            </div>

            <DashboardMap foods={[food]} selectedFood={food} heightClass="h-[360px]" />

            <div className="stat-card space-y-3">
              <h3 className="text-section-title text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-[var(--primary)]" /> Audit Log
              </h3>
              <div className="space-y-3 pt-2">
                {(timeline.length ? timeline : [{ details: "Donation published to the network", createdAt: new Date().toISOString() }]).map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 border-b border-[var(--border)] pb-3 text-xs last:border-0">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                    <div>
                      <p className="font-semibold text-[var(--text)]">{event.details || "Donation activity recorded"}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                        {event.performedByName || "System"} • {formatDate(event.createdAt || Date.now())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Recipient Compatibility</h3>
              <MatchScoreCard recommendation={recommendation || { confidenceScore: 0, ngoName: "Awaiting match" }} />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white/85 p-5 shadow-[var(--shadow)] backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[var(--primary-soft)] bg-[var(--primary-soft)] p-2.5 text-[var(--primary)]">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text)]">Donation details</h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Operational record</p>
                </div>
              </div>

              <div className="min-w-0 space-y-3 text-xs text-[var(--text)]">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Donation ID</span><span className="min-w-0 max-w-full break-all text-right font-semibold text-[var(--text)]">{food._id || food.traceabilityId || "N/A"}</span></div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Created</span><span className="min-w-0 max-w-full break-words text-right font-semibold text-[var(--text)]">{formatDate(food.createdAt)}</span></div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Status</span><span className="min-w-0 max-w-full break-words text-right font-semibold text-[var(--text)]">{food.status || "Available"}</span></div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Donor</span><span className="min-w-0 max-w-full break-words text-right font-semibold text-[var(--text)]">{food.donorName || "Unknown donor"}</span></div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Phone</span><span className="min-w-0 max-w-full break-all text-right font-semibold text-[var(--text)]">{donorPhone}</span></div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="text-[var(--text-secondary)]">Email</span><span className="min-w-0 max-w-full break-all text-right font-semibold text-[var(--text)]">{donorEmail}</span></div>
              </div>

              <a href={`/history?trace=${food.traceabilityId || food.traceId || food._id}`} className="btn-secondary w-full justify-center py-2 text-xs no-underline">
                Open Audit Page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
