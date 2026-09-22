import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../config/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight } from "lucide-react";

function Login() {
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
      const res = await axios.post(`${API_BASE}/api/users/login`, { email, password });
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

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
              <strong>2.4k</strong>
              <span>Meals rescued</span>
            </div>
            <div>
              <strong>94%</strong>
              <span>Success rate</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Active zones</span>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-header">
            <p className="auth-form-kicker">Account access</p>
            <h2>Sign in</h2>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-shell">
                <Mail className="field-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
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
              <button type="button" className="text-link">Forgot password?</button>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="auth-signup">
            New to EcoShare AI?
            <Link to="/register">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;