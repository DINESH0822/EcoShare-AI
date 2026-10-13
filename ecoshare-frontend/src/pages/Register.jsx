import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, Mail, Lock, User, Phone, MapPin, Building2, ShieldCheck, HeartHandshake, Settings2, ArrowRight } from "lucide-react";

function Register({ role: propRole }) {
  const { pathname } = useLocation();
  const [role, setRole] = useState(propRole || (pathname.includes("/ngo/") ? "NGO" : pathname.includes("/admin/") ? "Admin" : "Donor"));
  
  // Basic account fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NGO specific fields
  const [organizationName, setOrganizationName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [organizationType, setOrganizationType] = useState("ngo");
  const [dailyCapacity, setDailyCapacity] = useState("200");
  const [hasRefrigeration, setHasRefrigeration] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { API_BASE } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (role === "Admin") {
      toast.error("Admin accounts are provisioned securely by system admins. Please use admin login.");
      navigate("/admin/login");
      return;
    }

    setLoading(true);
    try {
      const endpoint = role === "NGO"
        ? `${API_BASE}/api/auth/ngo/register`
        : `${API_BASE}/api/auth/donor/register`;

      const payload = role === "NGO"
        ? {
            ngoName: organizationName.trim() || name.trim(),
            contactPerson: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: cleanPhone,
            address: address.trim() || (city.trim() ? `${city.trim()}, India` : "India"),
            city: city.trim() || "Mumbai",
            organizationType,
            dailyCapacity: Number(dailyCapacity) || 100,
            hasRefrigeration
          }
        : {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            phone: cleanPhone,
            role: "Donor"
          };

      const res = await axios.post(endpoint, payload);
      const data = res.data?.data || res.data;
      
      if (role === "NGO") {
        toast.success("NGO account registered successfully! Pending admin verification.");
        navigate("/ngo/login");
      } else {
        toast.success("Donor account created successfully! Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please check your inputs.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "Donor",
      label: "Food Donor",
      icon: <HeartHandshake className="w-5 h-5 text-[#087443]" />,
      desc: "Donate surplus food to local NGOs",
      bg: "bg-[#F7FBF7] border-[#DDEBD9] text-[#3A5048]",
      activeBg: "bg-[#E8F7ED] border-[#7FC59A] text-[#142A21] ring-2 ring-[#B8D7BE]",
    },
    {
      id: "NGO",
      label: "NGO Partner",
      icon: <ShieldCheck className="w-5 h-5 text-[#1E8E6A]" />,
      desc: "Request, track & distribute food",
      bg: "bg-[#F7FBF7] border-[#DDEBD9] text-[#3A5048]",
      activeBg: "bg-[#EDF8F5] border-[#8CC8B2] text-[#142A21] ring-2 ring-[#B9D8CF]",
    },
    {
      id: "Admin",
      label: "Platform Admin",
      icon: <Settings2 className="w-5 h-5 text-[#426F9D]" />,
      desc: "Authorized admin login only",
      bg: "bg-[#F7FBF7] border-[#DDEBD9] text-[#3A5048] opacity-70",
      activeBg: "bg-[#EEF3FF] border-[#A5B6DF] text-[#142A21] ring-2 ring-[#D5DEF5]",
      disabled: true,
    },
  ];

  return (
    <div className="auth-wrapper relative min-h-screen flex items-start justify-center p-4 pt-6 sm:p-6 sm:pt-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[rgba(22,131,75,0.08)] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[rgba(47,128,237,0.08)] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="auth-card relative z-10 w-full max-w-xl rounded-3xl p-6 sm:p-8 my-0"
      >
        {/* Header */}
        <div className="auth-register-header text-center mb-6">
          <div className="auth-register-icon mx-auto mb-3 w-12 h-12 rounded-2xl bg-[#E8F7ED] text-[#087443] flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142A21] tracking-tight">
            Join <span className="text-[#087443]">EcoShare AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5E7267] mt-1">
            {role === "NGO" ? "Register your organization to receive and distribute surplus food" : "Create your donor account to rescue food and eliminate waste"}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#5E7267] mb-2 uppercase tracking-wider">
            Select Role
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => !r.disabled && setRole(r.id)}
                disabled={r.disabled}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  r.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                } ${role === r.id ? r.activeBg : r.bg}`}
              >
                <div className="mb-1.5">{r.icon}</div>
                <p className="text-xs font-bold text-[#142A21] leading-tight">{r.label}</p>
                <p className="text-[10px] text-[#5E7267] leading-tight mt-1">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* NGO Organization Name if role === NGO */}
          {role === "NGO" && (
            <div>
              <label className="block text-xs font-bold text-[#5E7267] mb-1.5 uppercase tracking-wider" htmlFor="org-name">
                Organization / NGO Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7267]" />
                <input
                  id="org-name"
                  type="text"
                  placeholder="e.g. Robin Hood Army or Hope Shelter"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="eco-input pl-10"
                  required
                />
              </div>
            </div>
          )}

          {/* Contact Person Name */}
          <div>
            <label className="block text-xs font-bold text-[#5E7267] mb-1.5 uppercase tracking-wider" htmlFor="reg-name">
              {role === "NGO" ? "Authorized Representative / Contact Person *" : "Full Name *"}
            </label>

            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E7267]" />              <input
                id="reg-name"
                type="text"
                placeholder={role === "NGO" ? "Representative Name" : "Your full name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="eco-input pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile Phone */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider" htmlFor="reg-phone">
                Phone Number (10 digits) *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="eco-input pl-10"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider" htmlFor="reg-email">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="contact@org.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="eco-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* NGO extra fields */}
          {role === "NGO" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Organization Type
                  </label>
                  <select
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="eco-input cursor-pointer"
                  >
                    <option value="ngo">NGO / Charity</option>
                    <option value="food_bank">Food Bank</option>
                    <option value="shelter">Shelter</option>
                    <option value="orphanage">Orphanage</option>
                    <option value="community_kitchen">Community Kitchen</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Daily Capacity (Meals/day)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={dailyCapacity}
                    onChange={(e) => setDailyCapacity(e.target.value)}
                    className="eco-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    City / Region *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Pune, Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="eco-input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    Address / Operational Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Andheri East, Mumbai"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="eco-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reg-fridge"
                  checked={hasRefrigeration}
                  onChange={(e) => setHasRefrigeration(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="reg-fridge" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                  Has cold storage / refrigeration facility available
                </label>
              </div>
            </>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider" htmlFor="reg-pass">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="reg-pass"
                  type={showPass ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="eco-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text)] cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider" htmlFor="reg-conf">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  id="reg-conf"
                  type={showPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="eco-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating {role} Account...
              </>
            ) : (
              <>
                Register as {role === "NGO" ? "NGO Partner" : "Food Donor"} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[var(--surface-soft)] px-3 text-[var(--text-secondary)] font-semibold">Existing Account</span></div>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm">
          Already registered?{" "}
          <Link to={role === "NGO" ? "/ngo/login" : "/login"} className="text-[var(--primary)] font-bold hover:text-[var(--primary-dark)] no-underline">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;