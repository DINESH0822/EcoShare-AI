import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import LocationPicker from "../components/LocationPicker";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Building2, User, Phone, Mail, Award, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

function AddNGO() {
  const [formData, setFormData] = useState({
    ngoName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
    capacity: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { API_BASE, getAuthHeaders } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const submitNGO = async (e) => {
    e.preventDefault();
    if (!formData.address || !formData.latitude || !formData.longitude) {
      toast.error("Please pin the NGO location on the map.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/ngo`, formData, getAuthHeaders());
      toast.success("🏢 NGO registered and awaiting Admin approval!");
      setFormData({
        ngoName: "", contactPerson: "", phone: "", email: "",
        address: "", city: "", state: "", pincode: "",
        latitude: null, longitude: null, capacity: "",
      });
      setTimeout(() => navigate("/ngos"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register NGO");
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "ngoName", label: "NGO / Organization Name", type: "text", placeholder: "e.g. Helping Hands Foundation", icon: <Building2 className="w-4 h-4 text-slate-400" /> },
    { name: "contactPerson", label: "Contact Person", type: "text", placeholder: "e.g. Priya Sharma", icon: <User className="w-4 h-4 text-slate-400" /> },
    { name: "phone", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210", icon: <Phone className="w-4 h-4 text-slate-400" /> },
    { name: "email", label: "Email Address", type: "email", placeholder: "e.g. contact@ngo.org", icon: <Mail className="w-4 h-4 text-slate-400" /> },
    { name: "capacity", label: "Daily Claim Capacity (meals/day)", type: "number", placeholder: "e.g. 200", icon: <Award className="w-4 h-4 text-slate-400" /> },
  ];

  return (
    <div className="eco-bg pb-12">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> ENROLL COLLABORATORS
            </span>
          </div>
          <h1 className="text-section font-bold text-slate-900 tracking-tight">
            Register NGO Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create an NGO record. Registered profiles are verified by platform Admins before matching begins.
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="form-card"
        >
          {/* Approval notice banner */}
          <div className="bg-amber-50/40 border border-amber-100/60 p-4 rounded-xl flex items-start gap-3 mb-6">
            <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>Admin Verification Required:</strong> All NGO registrations are reviewed and approved by platform admins before being included in the AI matching algorithm.
            </p>
          </div>

          <form onSubmit={submitNGO} className="space-y-5">
            {/* Input fields */}
            {inputFields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide" htmlFor={`an-${field.name}`}>
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {field.icon}
                  </div>
                  <input
                    id={`an-${field.name}`}
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="eco-input pl-10"
                    required
                  />
                </div>
              </div>
            ))}

            {/* GPS Location Picker */}
            <div className="border-t border-slate-100 pt-6">
              <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Pin NGO Location & Geocode Address
              </label>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.address || !formData.latitude}
              className="btn-primary w-full py-3.5 mt-2 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Submitting Profile...
                </>
              ) : (
                <>
                  Register NGO Profile <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

export default AddNGO;