import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Donor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "https://ecoshare-ai.onrender.com/api/users/register",
        { name, email, password, role }
      );

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    Donor: "🍱 Donate surplus food to those in need",
    NGO: "🌿 Receive & distribute food donations",
    Admin: "⚙️ Manage the entire EcoShare platform",
  };

  return (
    <div className="auth-wrapper eco-bg">
      <div style={{
        position: "fixed", top: "10%", right: "8%",
        width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "5%", left: "5%",
        width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div className="auth-card fade-in" style={{ maxWidth: "460px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "16px",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", marginBottom: "14px",
            boxShadow: "0 0 28px rgba(59,130,246,0.3)",
          }}>✨</div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.85rem", fontWeight: "800",
            margin: 0, marginBottom: "6px",
          }}>
            <span style={{ color: "#f0f9ff" }}>Join </span>
            <span style={{
              background: "linear-gradient(135deg, #10b981, #34d399)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>EcoShare AI</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
            Create your account and start making a difference
          </p>
        </div>

        <form onSubmit={registerUser}>
          {/* Name */}
          <div style={{ marginBottom: "14px" }}>
            <label className="eco-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="eco-input"
              required
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label className="eco-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="eco-input"
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "14px" }}>
            <label className="eco-label" htmlFor="reg-password">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                type={showPass ? "text" : "password"}
                placeholder="Create a strong password"
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
                  color: "#64748b", fontSize: "15px",
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: "8px" }}>
            <label className="eco-label" htmlFor="reg-role">I'm registering as</label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="eco-input"
            >
              <option value="Donor">Donor</option>
              <option value="NGO">NGO</option>
              <option value="Admin">Admin</option>
            </select>
            {role && (
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "6px" }}>
                {roleDescriptions[role]}
              </p>
            )}
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginTop: "8px",
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-secondary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "14px",
              fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px", borderTopColor: "#ffffff" }} />
                Creating Account...
              </>
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <hr className="divider" />
        <p style={{ textAlign: "center", color: "#475569", fontSize: "0.88rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#34d399", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;