import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import StatusPipeline from "../components/StatusPipeline";
import DashboardMap from "../components/DashboardMap";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, Thermometer, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function OperationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();

  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [tempInput, setTempInput] = useState("65");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOperationDetail();
  }, [id, isDemoMode]);

  const fetchOperationDetail = async () => {
    setLoading(true);
    setError("");
    setNotFound(false);

    if (isDemoMode) {
      setOperation({
        _id: id,
        status: "en_route",
        assignedNgoName: "Robin Hood Army - BKC Chapter",
        temperatureAtPickup: 64,
        timeline: [
          { status: "claimed", note: "Donation claimed by NGO", timestamp: new Date().toISOString() },
          { status: "en_route", note: "Volunteer en route to donor address", timestamp: new Date().toISOString() }
        ],
        foodId: {
          _id: "food-1",
          foodName: "Excess Catering Cooked Rice & Paneer Curry",
          quantity: 120,
          address: "BKC Expressway, Bandra East, Mumbai",
          latitude: 19.0657,
          longitude: 72.8687
        }
      });
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/api/operations/${id}`);
      const detail = res.data?.data ?? res.data;
      if (!detail) {
        setOperation(null);
        setNotFound(true);
        return;
      }
      setOperation(detail);
    } catch (err) {
      const status = err?.response?.status;
      setOperation(null);
      setNotFound(status === 404);
      setError(status === 404 ? "Rescue operation not found." : "Unable to load rescue operation details.");
      if (status !== 404) {
        toast.error("Unable to load rescue operation details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    try {
      await axios.patch(`/api/operations/${id}/status`, {
        status: nextStatus,
        temperatureAtPickup: parseFloat(tempInput),
        note: `Status updated to ${nextStatus}`
      });
      toast.success(`Operation status updated to ${nextStatus}!`);
      fetchOperationDetail();
    } catch (err) {
      toast.error("Failed to update operation status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="eco-bg min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="spinner mx-auto" />
          <p className="text-xs text-slate-400 mt-3">Loading rescue operation details...</p>
        </div>
      </div>
    );
  }

  if (error || notFound || !operation) {
    return (
      <div className="eco-bg min-h-screen">
        <DemoModeBanner />
        <Navbar />
        <main className="page-container">
          <div className="bg-[#101D2D] border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
            <h1 className="text-page-title">{notFound ? "Rescue operation not found" : "Unable to load rescue operation details"}</h1>
            <p className="text-body">{error || "The rescue operation you are trying to open is missing or the server could not return it."}</p>
            <button onClick={() => navigate("/operations")} className="btn-primary">Return to operations</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="eco-bg min-h-screen pb-20">
      <DemoModeBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Operations
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block mb-1">
              Operation ID: #{operation._id}
            </span>
            <h1 className="text-2xl font-extrabold text-white">{operation.foodId?.foodName || "Food Rescue Operation"}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Assigned NGO: <strong className="text-white">{operation.assignedNgoName || operation.ngoName || "Pending assignment"}</strong></span>
              <span>•</span>
              <span>Status: <strong className="text-sky-400 uppercase">{operation.status}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {operation.status !== "completed" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("en_route")}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 text-xs font-bold transition"
                >
                  Mark En Route
                </button>
                <button
                  onClick={() => handleStatusUpdate("collected")}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-bold transition"
                >
                  Mark Collected
                </button>
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:brightness-110 transition"
                >
                  Mark Completed
                </button>
              </>
            )}
          </div>
        </div>

        <StatusPipeline currentStatus={operation.status} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-emerald-400" /> Pickup Temperature Verification
            </h3>
            <p className="text-xs text-slate-400">Record measured food core temperature (°C) at pickup time.</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="eco-input py-2 text-xs"
                placeholder="Temp in °C (e.g., 65)"
              />
              <button
                onClick={() => handleStatusUpdate(operation.status)}
                className="btn-secondary py-2 text-xs whitespace-nowrap"
              >
                Save Log
              </button>
            </div>
            {operation.temperatureAtPickup && (
              <span className="text-xs font-bold text-emerald-400 block pt-1">
                ✓ Recorded at pickup: {operation.temperatureAtPickup}°C
              </span>
            )}
          </div>

          <div className="stat-card md:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Operational Timeline
            </h3>
            <div className="space-y-2 text-xs">
              {(operation.timeline || []).map((t, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200 capitalize">{t.note || t.status}</span>
                  <span className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {operation.foodId && <DashboardMap foods={[operation.foodId]} selectedFood={operation.foodId} />}
      </main>

      <EcoBot />
    </div>
  );
}
