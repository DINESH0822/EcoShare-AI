import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import LocationPicker from "../components/LocationPicker";
import EcoBot from "../components/EcoBot";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, MapPin } from "lucide-react";

function AddFood() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    donorName: "",
    donorType: "Individual",
    category: "cooked_meals",
    storageCondition: "ambient",
    temperatureChecked: true,
    isEmergency: false,
    expiryTime: "",
    cookedTime: "",
    notes: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 19.076,
    longitude: 72.8777,
    phone: "9820198201",
    phoneVerified: true
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleLocationChange = ({ address, city, state, pincode, latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      latitude,
      longitude,
    }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.foodName || !formData.quantity || !formData.donorName)) {
      toast.error("Please fill in food title, quantity, and donor name.");
      return;
    }
    if (step === 2 && !formData.expiryTime) {
      toast.error("Please select an expiry time window.");
      return;
    }
    if (step === 3 && !formData.address) {
      toast.error("Please pin a location on the map.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const submitFood = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/food", formData, getAuthHeaders());
      toast.success("Food donation created!");
      setTimeout(() => navigate("/donations"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Safety" },
    { num: 3, label: "Pickup" },
    { num: 4, label: "Review" },
  ];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-page-title">Create Food Donation</h1>
          <p className="text-body mt-1">Publish surplus food for AI matching and nearby NGO pickup.</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-3 flex items-center justify-between">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center ${
                step === s.num ? "bg-[#3B82F6] text-white" : step > s.num ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "bg-[#07111F] text-[#64748B]"
              }`}>
                {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? "text-white" : "text-[#94A3B8]"}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* 2-Column Form Workspace: Left Form / Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left 65%: Form Workspace */}
          <form onSubmit={submitFood} className="lg:col-span-2 bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-6 space-y-5">
            
            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-section-title text-base">Step 1: Basic Information</h3>

                <div>
                  <label className="eco-label">Food Title / Items</label>
                  <input
                    type="text"
                    name="foodName"
                    placeholder="e.g. Cooked Rice & Paneer (100 servings)"
                    value={formData.foodName}
                    onChange={handleChange}
                    className="eco-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="eco-label">Total Servings</label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="e.g. 100"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="eco-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="eco-label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="eco-input bg-[#07111F]"
                    >
                      <option value="cooked_meals">Cooked Meals</option>
                      <option value="raw_vegetables">Raw Produce</option>
                      <option value="bakery">Bakery</option>
                      <option value="dairy">Dairy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="eco-label">Donor Business / Name</label>
                  <input
                    type="text"
                    name="donorName"
                    placeholder="e.g. Grand Hyatt Banquet"
                    value={formData.donorName}
                    onChange={handleChange}
                    className="eco-input"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Safety & Expiry */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-section-title text-base">Step 2: Safety & Expiry Window</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="eco-label">Storage Condition</label>
                    <select
                      name="storageCondition"
                      value={formData.storageCondition}
                      onChange={handleChange}
                      className="eco-input bg-[#07111F]"
                    >
                      <option value="ambient">Ambient Room Temp</option>
                      <option value="refrigerated">Refrigerated (Below 4°C)</option>
                      <option value="hot_holding">Hot Holding (Above 60°C)</option>
                      <option value="frozen">Frozen Storage</option>
                    </select>
                  </div>

                  <div>
                    <label className="eco-label">Expiry Time Window</label>
                    <input
                      type="datetime-local"
                      name="expiryTime"
                      value={formData.expiryTime}
                      onChange={handleChange}
                      className="eco-input"
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#07111F] border border-[#1E3045] rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-white">Emergency High Priority</h4>
                    <p className="text-[11px] text-[#94A3B8]">Mark if remaining shelf life is under 2 hours.</p>
                  </div>
                  <input
                    type="checkbox"
                    name="isEmergency"
                    checked={formData.isEmergency}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#3B82F6] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-section-title text-base">Step 3: Pickup Location</h3>
                <LocationPicker
                  value={{
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode
                  }}
                  onChange={handleLocationChange}
                />
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-section-title text-base">Step 4: Final Review</h3>
                <p className="text-xs text-[#94A3B8]">
                  Review your donation parameters on the right live preview card before publishing to the network.
                </p>
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1E3045]">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary text-sm min-h-[44px]"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-sm min-h-[44px]"
                >
                  {loading ? "Publishing..." : "Publish donation"}
                </button>
              )}
            </div>

          </form>

          {/* Right 35%: Live Donation Preview Card */}
          <div className="bg-[#0D1A2A] border border-[#1E3045] rounded-xl p-5 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#1E3045] pb-2">
              <span className="text-xs font-semibold text-[#3B82F6] uppercase font-mono">Live Card Preview</span>
              <span className="text-[10px] text-[#64748B]">Updates in real-time</span>
            </div>

            <div className="p-4 bg-[#07111F] border border-[#1E3045] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className={`badge-status ${formData.isEmergency ? "badge-emergency" : "badge-available"}`}>
                  {formData.isEmergency ? "Emergency" : "Available"}
                </span>
                <span className="text-[10px] font-mono text-[#64748B]">ECO-2026-PREVIEW</span>
              </div>

              <h4 className="text-sm font-bold text-white">
                {formData.foodName || "Untitled Food Donation"}
              </h4>
              <p className="text-xs text-[#94A3B8]">
                by {formData.donorName || "Donor Name"}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2 bg-[#0D1A2A] rounded border border-[#1E3045]">
                  <span className="text-[10px] text-[#94A3B8] block">Quantity</span>
                  <span className="font-semibold text-[#3B82F6]">{formData.quantity || 0} servings</span>
                </div>
                <div className="p-2 bg-[#0D1A2A] rounded border border-[#1E3045]">
                  <span className="text-[10px] text-[#94A3B8] block">Storage</span>
                  <span className="font-semibold text-white capitalize">{formData.storageCondition}</span>
                </div>
              </div>

              <div className="text-xs text-[#94A3B8] flex items-center gap-1.5 pt-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                <span className="truncate">{formData.address || "Location will appear here..."}</span>
              </div>
            </div>
          </div>

        </div>

        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default AddFood;