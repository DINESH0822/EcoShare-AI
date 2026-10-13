import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import AppShell from "../components/AppShell";
import { PageHeader, StatusBadge } from "../components/DesignSystem";
import StatusPipeline from "../components/StatusPipeline";
import DashboardMap from "../components/DashboardMap";
import ErrorState from "../components/ErrorState";
import { useDemo } from "../config/DemoContext";
import { ArrowLeft, Thermometer, Clock, MapPin, Package, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function OperationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemoMode } = useDemo();

  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tempInput, setTempInput] = useState("65");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOperationDetail();
  }, [id, isDemoMode]);

  const fetchOperationDetail = async () => {
    setLoading(true);
    setError("");

    if (isDemoMode) {
      setOperation({
        _id: id || "507f1f77bcf86cd799439011",
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
          quantityUnit: "meals",
          address: "BKC Expressway, Bandra East, Mumbai",
          latitude: 19.0657,
          longitude: 72.8687
        }
      });
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api/operations/${id}`);
      const detail = res.data?.data ?? res.data;
      if (!detail) {
        setOperation(null);
        setError("Rescue operation record is not found in database.");
        return;
      }
      setOperation(detail);
    } catch (err) {
      setOperation(null);
      setError(err.message || "Unable to load rescue operation details from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/api/operations/${id}/status`, {
        status: nextStatus,
        temperatureAtPickup: parseFloat(tempInput),
        note: `Status updated to ${nextStatus}`
      });
      toast.success(`Operation status updated to ${nextStatus.replace(/_/g, " ")}!`);
      fetchOperationDetail();
    } catch (err) {
      toast.error(err.message || "Failed to update operation status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#9CAFC3] mt-4 font-medium">Loading rescue operation details...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !operation) {
    return (
      <AppShell>
        <div className="py-12 max-w-xl mx-auto">
          <ErrorState
            title="Rescue Operation Not Found"
            message={error || "The operation record could not be retrieved from the server."}
            onRetry={() => navigate("/operations")}
          />
        </div>
      </AppShell>
    );
  }

  const food = operation.foodId || {};

  return (
    <AppShell>
      <PageHeader
        title={food.foodName || "Food Rescue Operation"}
        description={`Operation #${operation._id} • Traceable pickup & delivery handoff`}
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Operations", to: "/operations" },
          { label: `Op #${operation._id?.slice(-6)}` },
        ]}
        badge={<StatusBadge status={operation.status} />}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {operation.status !== "completed" && (
              <>
                <button
                  onClick={() => handleStatusUpdate("en_route")}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/25 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Mark En Route
                </button>
                <button
                  onClick={() => handleStatusUpdate("collected")}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/25 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  Mark Collected
                </button>
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={updating}
                  className="px-4 py-2 rounded-lg bg-[#10B981] text-[#06111F] text-xs font-extrabold shadow-md shadow-[#10B981]/20 hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                >
                  Confirm Completed
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Top Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#3B82F6] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Rescuing Organization
          </div>
          <div className="text-lg font-bold text-[#F1F5F9]">
            {operation.assignedNgoName || operation.ngoName || "Pending NGO Assignment"}
          </div>
          <p className="text-xs text-[#9CAFC3] mt-1">Verified Partner Channel</p>
        </div>

        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-wider mb-2">
            <Package className="w-4 h-4" /> Food Volume & Details
          </div>
          <div className="text-lg font-bold text-[#F1F5F9]">
            {food.quantity || "—"} {food.quantityUnit || "meals / servings"}
          </div>
          <p className="text-xs text-[#9CAFC3] mt-1 truncate">{food.category || "Cooked Meals"}</p>
        </div>

        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5">
          <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" /> Pickup Address
          </div>
          <div className="text-sm font-semibold text-[#F1F5F9] line-clamp-2">
            {food.address || "Address registered on file"}
          </div>
          <p className="text-xs text-[#9CAFC3] mt-1">{food.city || "Urban District"}</p>
        </div>
      </div>

      {/* Lifecycle Progress Pipeline */}
      <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6 mb-8">
        <h3 className="text-sm font-bold text-[#F1F5F9] mb-4">Rescue Handoff Lifecycle</h3>
        <StatusPipeline currentStatus={operation.status} />
      </div>

      {/* Food Safety Temp & Operational Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-[#10B981]" /> Core Temperature Log
          </h3>
          <p className="text-xs text-[#9CAFC3] leading-relaxed">
            Record verified core temperature (°C) at pickup to meet cold-chain or hot-holding safety rules.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              className="bg-[#071525] border border-[#20364D] rounded-lg px-3 py-2 text-xs text-[#F1F5F9] w-full focus:outline-none focus:border-[#10B981]"
              placeholder="Temp in °C (e.g. 65)"
            />
            <button
              onClick={() => handleStatusUpdate(operation.status)}
              className="px-3 py-2 rounded-lg bg-[#122840] border border-[#20364D] hover:bg-[#122840]/80 text-xs font-bold text-[#F1F5F9] shrink-0 cursor-pointer"
            >
              Log Temp
            </button>
          </div>
          {operation.temperatureAtPickup && (
            <div className="text-xs font-bold text-[#10B981] flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified at pickup: {operation.temperatureAtPickup}°C</span>
            </div>
          )}
        </div>

        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5 md:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#3B82F6]" /> Audited Operational Timeline
          </h3>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {(operation.timeline || []).length === 0 ? (
              <p className="text-xs text-[#9CAFC3]">No state transitions logged yet.</p>
            ) : (
              (operation.timeline || []).map((t, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-[#071525] rounded-lg border border-[#20364D]/60 text-xs"
                >
                  <span className="font-semibold text-[#F1F5F9] capitalize">
                    {t.note || t.status?.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-[#9CAFC3] font-mono">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Location Map */}
      {food.latitude && food.longitude && (
        <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-6">
          <h3 className="text-sm font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#10B981]" /> Pickup & Route Map
          </h3>
          <DashboardMap foods={[food]} selectedFood={food} />
        </div>
      )}
    </AppShell>
  );
}
