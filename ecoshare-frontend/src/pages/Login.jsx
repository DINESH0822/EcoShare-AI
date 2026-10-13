import { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, Mail, Lock, ShieldCheck, HeartHandshake, Settings2, ArrowRight } from "lucide-react";

function Login({ role: propRole }) {
  const location = useLocation();
  const initialRole = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/donor/")) return "Donor";
    if (path.includes("/ngo/")) return "NGO";
    if (path.includes("/admin/")) return "Admin";
    return propRole || "Donor";
  }, [location.pathname, propRole]);

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, API_BASE } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = selectedRole === "NGO"
        ? `${API_BASE}/api/auth/ngo/login`
        : selectedRole === "Admin"
          ? `${API_BASE}/api/users/login`
          : `${API_BASE}/api/auth/donor/login`;

      const payload = { email: email.trim().toLowerCase(), password };

      const res = await axios.post(endpoint, payload);
      const authData = res.data?.data || res.data;
      const user = authData?.user || authData;
      
      // Verification check for Admin role login
      if (selectedRole === "Admin" && user.role !== "Admin") {
        toast.error("Unauthorized: This account does not possess Admin privileges.");
        setLoading(false);
        return;
      }

      login({ ...user, token: authData?.token || user?.token });
      toast.success(`Welcome back, ${user.name || "there"}!`);

      if (user.role === "Admin" || selectedRole === "Admin") {
        navigate("/admin");
      } else if (user.role === "NGO" || selectedRole === "NGO") {
        navigate("/ngo/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "Donor",
      label: "Food Donor",
      icon: <HeartHandshake className="w-4 h-4 text-[#087443]" />
    },
    {
      id: "NGO",
      label: "NGO Partner",
      icon: <ShieldCheck className="w-4 h-4 text-[#1E8E6A]" />
    },
    {
      id: "Admin",
      label: "Platform Admin",
      icon: <Settings2 className="w-4 h-4 text-[#426F9D]" />
    }
  ];

  return (
    <div className="auth-wrapper relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="auth-spot auth-spot--green" />
        <div className="auth-spot auth-spot--blue" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="auth-shell relative z-10 w-full max-w-5xl overflow-hidden"
      >
        <div className="auth-brand-panel">
          <div className="auth-brand-mark">
            <Leaf className="w-7 h-7" />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            AI-powered rescue network
          </div>

          <h1 className="auth-brand-title">
            Welcome back to <span>EcoShare AI</span>
          </h1>
          <p className="auth-brand-copy">
            AI-powered food rescue operations platform for connecting surplus food, verified NGOs, volunteers, and communities in real time.
          </p>

          <div className="auth-metrics">
            <div>
              <strong>2.4k+</strong>
              <span>Meals rescued</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Audit trail</span>
            </div>
            <div>
              <strong>Verified</strong>
              <span>FSSAI aligned</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <p className="auth-form-kicker">Account access</p>
            <h2>Sign in to EcoShare AI</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Select your portal role to access authorized tools</p>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#F3FAF5] border border-[#DDEBD9] rounded-xl mb-4">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === r.id
                    ? "bg-white text-[#142A21] border border-[#B8D7BE] shadow-sm"
                    : "text-[#5F6F63] hover:text-[#142A21]"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-shell">
                <Mail className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder={selectedRole === "Admin" ? "admin@ecoshare.org" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="field-row">
                <label htmlFor="login-password">Password</label>
                <button type="button" className="text-link" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <div className="input-shell">
                <Lock className="field-icon" />
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-row">
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <span className="text-xs text-[var(--text-secondary)]">
                {selectedRole === "Admin" ? "Protected admin portal" : "Protected access"}
              </span>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In as {selectedRole}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {selectedRole !== "Admin" ? (
            <p className="auth-signup">
              New to EcoShare AI?{" "}
              <Link to={selectedRole === "NGO" ? "/ngo/register" : "/register"}>
                Create an account
              </Link>
            </p>
          ) : (
            <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
              Admin credentials are provisioned via server environment variables.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Login;