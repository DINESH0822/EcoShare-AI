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
    { name: "ngoName", label: "NGO / Organization Name", type: "text", placeholder: "e.g. Helping Hands Foundation", icon: <Building2 className="w-4 h-4 text-[var(--text-secondary)]" /> },
    { name: "contactPerson", label: "Contact Person", type: "text", placeholder: "e.g. Priya Sharma", icon: <User className="w-4 h-4 text-[var(--text-secondary)]" /> },
    { name: "phone", label: "Phone Number", type: "text", placeholder: "e.g. 9876543210", icon: <Phone className="w-4 h-4 text-[var(--text-secondary)]" /> },
    { name: "email", label: "Email Address", type: "email", placeholder: "e.g. contact@ngo.org", icon: <Mail className="w-4 h-4 text-[var(--text-secondary)]" /> },
    { name: "capacity", label: "Daily Claim Capacity (meals/day)", type: "number", placeholder: "e.g. 200", icon: <Award className="w-4 h-4 text-[var(--text-secondary)]" /> },
  ];

  return (
    <div className="eco-bg pb-12">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" /> ENROLL COLLABORATORS
            </span>
          </div>
          <h1 className="text-section font-bold tracking-tight text-[var(--text)]">
            Register NGO Profile
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create an NGO record. Registered profiles are verified by platform Admins before matching begins.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="rounded-[28px] border border-[var(--border)] bg-white/85 p-6 shadow-[var(--shadow)] backdrop-blur-sm"
        >
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
            <p className="text-xs leading-relaxed text-[var(--text)]">
              <strong className="font-bold text-[var(--text)]">Admin Verification Required:</strong> All NGO registrations are reviewed and approved by platform admins before being included in the AI matching algorithm.
            </p>
          </div>

          <form onSubmit={submitNGO} className="space-y-5">
            {inputFields.map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--text)]" htmlFor={`an-${field.name}`}>
                  {field.label}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
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

            <div className="border-t border-[var(--border)] pt-6">
              <label className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--text)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--primary)]" /> Pin NGO Location & Geocode Address
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

            <button
              type="submit"
              disabled={loading || !formData.address || !formData.latitude}
              className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3.5 font-semibold"
            >
              {loading ? (
                <>
                  <div className="spinner h-4 w-4" />
                  Submitting Profile...
                </>
              ) : (
                <>
                  Register NGO Profile <ArrowRight className="h-4 w-4" />
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