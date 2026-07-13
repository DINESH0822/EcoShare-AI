import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://ecoshare-ai.onrender.com/api/users/login",
        { email, password }
      );

      localStorage.setItem("userInfo", JSON.stringify(res.data));
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper eco-bg">
      {/* Decorative blobs */}
      <div style={{
        position: "fixed", top: "15%", left: "10%",
        width: "320px", height: "320px",
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "15%", right: "10%",
        width: "280px", height: "280px",
        background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div className="auth-card fade-in" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{
            width: "60px", height: "60px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "16px",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", marginBottom: "16px",
            boxShadow: "0 0 30px rgba(16,185,129,0.35)",
          }}>🌾</div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "2rem", fontWeight: "800",
            margin: 0, marginBottom: "6px",
          }}>
            <span style={{
              background: "linear-gradient(135deg, #10b981, #34d399)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>EcoShare</span>
            {" "}
            <span style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>AI</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
            Reducing food waste, feeding futures
          </p>
        </div>

        {/* Form */}
        <form onSubmit={loginUser}>
          <div style={{ marginBottom: "8px" }}>
            <label className="eco-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="eco-input"
              required
            />
          </div>

          <div style={{ marginBottom: "8px", marginTop: "16px" }}>
            <label className="eco-label" htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="eco-input"
                style={{ paddingRight: "48px" }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#64748b", fontSize: "16px",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginTop: "12px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "14px",
              fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                Signing in...
              </>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: "center", color: "#475569", fontSize: "0.88rem" }}>
          New here?{" "}
          <Link to="/register" style={{ color: "#34d399", fontWeight: "600", textDecoration: "none" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;