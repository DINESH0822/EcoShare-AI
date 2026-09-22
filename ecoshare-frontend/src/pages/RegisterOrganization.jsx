import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import LocationPicker from "../components/LocationPicker";
import EcoBot from "../components/EcoBot";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Building, CheckCircle2, ArrowRight, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "ngo",
    description: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 19.076,
    longitude: 72.8777,
    capacity: 200,
    pickupRadius: 15,
    refrigerationAvailable: true,
    registrationNumber: ""
  });

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
      longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.address) {
      toast.error("Please fill in organization name and location.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/organizations/register", formData);
      toast.success("Organization registered and submitted for PENDING_REVIEW audit!");
      setTimeout(() => navigate("/ngos"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-bg min-h-screen pb-20">
      <DemoModeBanner />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" /> Recipient Partner Registration
          </div>
          <h1 className="text-section font-extrabold text-white">Register Food Rescue Organization</h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit your organization details for official verification. Pending applications undergo document audit before claim capabilities are activated.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="stat-card space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Organization Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eco-label">Organization Name</label>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="e.g. Robin Hood Army - BKC Chapter"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>

              <div>
                <label className="eco-label">Organization Type</label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="eco-input bg-slate-950"
                >
                  <option value="ngo">NGO / Non-Profit</option>
                  <option value="food_bank">Food Bank</option>
                  <option value="shelter">Community Shelter</option>
                  <option value="orphanage">Orphanage</option>
                  <option value="community_kitchen">Community Kitchen</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eco-label">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Representative Full Name"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>

              <div>
                <label className="eco-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Operational Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="eco-label">Daily Capacity (Meals/Day)</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g. 250"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>

              <div>
                <label className="eco-label">Max Pickup Service Radius (km)</label>
                <input
                  type="number"
                  name="pickupRadius"
                  placeholder="e.g. 15"
                  value={formData.pickupRadius}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              3. Organization Location
            </h3>
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
          >
            {loading ? "Submitting Registration..." : "Submit Organization for Verification Audit"}
          </button>
        </form>
      </main>

      <EcoBot />
    </div>
  );
}
