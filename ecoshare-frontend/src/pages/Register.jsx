import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, Mail, Lock, User, ShieldCheck, HeartHandshake, Settings2, ArrowRight } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Donor");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { API_BASE } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/users/register`, { name, email, password, role });
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "Donor",
      label: "Food Donor",
      icon: <HeartHandshake className="w-5 h-5 text-emerald-400" />,
      desc: "Donate surplus food to local NGOs",
      bg: "bg-slate-900/60 border-slate-800 text-slate-300",
      activeBg: "bg-emerald-950/40 border-emerald-500/80 text-white ring-2 ring-emerald-500/30",
    },
    {
      id: "NGO",
      label: "NGO Partner",
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      desc: "Request, track & distribute food",
      bg: "bg-slate-900/60 border-slate-800 text-slate-300",
      activeBg: "bg-sky-950/40 border-sky-500/80 text-white ring-2 ring-sky-500/30",
    },
    {
      id: "Admin",
      label: "Platform Admin",
      icon: <Settings2 className="w-5 h-5 text-indigo-400" />,
      desc: "Moderate users & review logs",
      bg: "bg-slate-900/60 border-slate-800 text-slate-300",
      activeBg: "bg-indigo-950/40 border-indigo-500/80 text-white ring-2 ring-indigo-500/30",
    },
  ];

  return (
    <div className="auth-wrapper relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[rgba(22,131,75,0.08)] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[rgba(47,128,237,0.08)] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="auth-card relative z-10 w-full max-w-lg rounded-3xl p-8 my-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[linear-gradient(135deg,#16834b,#0f5132)] text-white rounded-2xl inline-flex items-center justify-center mb-4 shadow-[0_8px_24px_rgba(22,131,75,0.18)]">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Join{" "}
            <span className="text-[var(--primary-dark)]">
              EcoShare AI
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1.5 font-medium">
            Create your account and start making a measurable impact
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider" htmlFor="reg-name">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="eco-input pl-10 bg-slate-900/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-sky-400"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider" htmlFor="reg-email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="eco-input pl-10 bg-slate-900/80 border-slate-700/80 text-white placeholder-slate-500 focus:border-sky-400"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider" htmlFor="reg-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="reg-password"
                type={showPass ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input pl-10 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text)] focus:outline-none cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === r.id ? r.activeBg : r.bg
                  }`}
                >
                  <div className="mb-2">{r.icon}</div>
                  <p className="text-xs font-bold text-white">{r.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 font-bold text-sm tracking-wide flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-[var(--text-secondary)] font-semibold">Existing Account</span></div>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm">
          Already registered?{" "}
          <Link to="/login" className="text-[var(--primary-dark)] font-bold hover:text-[var(--primary)] no-underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;