import { useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import LocationPicker from "../components/LocationPicker";
import EcoBot from "../components/EcoBot";
import { useNavigate } from "react-router-dom";
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
      await api.post("/api/food", formData);
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
          <div>
            <h1 className="text-page-title">Create Food Donation</h1>
            <p className="text-body mt-1">Publish surplus food for AI matching and nearby NGO pickup.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-3 shadow-[var(--shadow)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2">
              {steps.map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    step === s.num ? "bg-[var(--primary)] text-white" : step > s.num ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "bg-[var(--surface)] text-[var(--text-secondary)]"
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={`hidden text-xs font-medium sm:inline ${step === s.num ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <form onSubmit={submitFood} className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-white/85 p-6 shadow-[var(--shadow)] backdrop-blur-sm space-y-5">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-section-title text-base">Step 1: Basic Information</h3>

                  <div>
                    <label className="eco-label">Food Title / Items</label>
                    <input type="text" name="foodName" placeholder="e.g. Cooked Rice & Paneer (100 servings)" value={formData.foodName} onChange={handleChange} className="eco-input" required />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="eco-label">Total Servings</label>
                      <input type="number" name="quantity" placeholder="e.g. 100" value={formData.quantity} onChange={handleChange} className="eco-input" required />
                    </div>

                    <div>
                      <label className="eco-label">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="eco-input bg-[var(--surface-soft)]">
                        <option value="cooked_meals">Cooked Meals</option>
                        <option value="raw_vegetables">Raw Produce</option>
                        <option value="bakery">Bakery</option>
                        <option value="dairy">Dairy</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="eco-label">Donor Business / Name</label>
                    <input type="text" name="donorName" placeholder="e.g. Grand Hyatt Banquet" value={formData.donorName} onChange={handleChange} className="eco-input" required />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-section-title text-base">Step 2: Safety & Expiry Window</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="eco-label">Storage Condition</label>
                      <select name="storageCondition" value={formData.storageCondition} onChange={handleChange} className="eco-input bg-[var(--surface-soft)]">
                        <option value="ambient">Ambient Room Temp</option>
                        <option value="refrigerated">Refrigerated (Below 4°C)</option>
                        <option value="hot_holding">Hot Holding (Above 60°C)</option>
                        <option value="frozen">Frozen Storage</option>
                      </select>
                    </div>

                    <div>
                      <label className="eco-label">Expiry Time Window</label>
                      <input type="datetime-local" name="expiryTime" value={formData.expiryTime} onChange={handleChange} className="eco-input" required />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5">
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--text)]">Emergency High Priority</h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">Mark if remaining shelf life is under 2 hours.</p>
                    </div>
                    <input type="checkbox" name="isEmergency" checked={formData.isEmergency} onChange={handleChange} className="h-4 w-4 cursor-pointer accent-[var(--primary)] rounded" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-section-title text-base">Step 3: Pickup Location</h3>
                  <LocationPicker value={{ latitude: formData.latitude, longitude: formData.longitude, address: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode }} onChange={handleLocationChange} />
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-section-title text-base">Step 4: Final Review</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Review your donation parameters on the right live preview card before publishing to the network.</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="btn-secondary text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button type="button" onClick={nextStep} className="btn-primary text-sm min-h-[44px]">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="btn-primary text-sm min-h-[44px]">
                    {loading ? "Publishing..." : "Publish donation"}
                  </button>
                )}
              </div>
            </form>

            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-white/85 p-5 shadow-[var(--shadow)] backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">Live Card Preview</span>
                <span className="text-[10px] text-[var(--text-secondary)]">Updates in real-time</span>
              </div>

              <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between">
                  <span className={`badge-status ${formData.isEmergency ? "badge-emergency" : "badge-available"}`}>
                    {formData.isEmergency ? "Emergency" : "Available"}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">ECO-2026-PREVIEW</span>
                </div>

                <h4 className="text-sm font-bold text-[var(--text)]">{formData.foodName || "Untitled Food Donation"}</h4>
                <p className="text-xs text-[var(--text-secondary)]">by {formData.donorName || "Donor Name"}</p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="rounded border border-[var(--border)] bg-white p-2">
                    <span className="block text-[10px] text-[var(--text-secondary)]">Quantity</span>
                    <span className="font-semibold text-[var(--primary)]">{formData.quantity || 0} servings</span>
                  </div>
                  <div className="rounded border border-[var(--border)] bg-white p-2">
                    <span className="block text-[10px] text-[var(--text-secondary)]">Storage</span>
                    <span className="font-semibold capitalize text-[var(--text)]">{formData.storageCondition}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 truncate pt-1 text-xs text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--primary)]" />
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