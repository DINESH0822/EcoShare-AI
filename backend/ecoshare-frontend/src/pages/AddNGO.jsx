import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AddNGO() {
  const [formData, setFormData] = useState({
    ngoName: "",
    contactPerson: "",
    phone: "",
    email: "",
    location: "",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitNGO = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("https://ecoshare-ai.onrender.com/api/ngo", formData);
      toast.success("🏢 NGO registered successfully!", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      setFormData({ ngoName: "", contactPerson: "", phone: "", email: "", location: "", capacity: "" });
      setTimeout(() => navigate("/ngos"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to register NGO", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eco-bg" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div className="fade-in" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
            <div style={{
              width: "48px", height: "48px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 0 20px rgba(59,130,246,0.3)",
            }}>🏢</div>
            <div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.9rem", fontWeight: "800", margin: 0,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Register New NGO</h1>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
                Add an NGO partner to the EcoShare AI network
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="form-card fade-in fade-in-delay-1">
          <form onSubmit={submitNGO} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Row 1 */}
            <div>
              <label className="eco-label" htmlFor="ngo-name">🏢 NGO Name</label>
              <input
                id="ngo-name"
                type="text"
                name="ngoName"
                placeholder="Full name of the organization"
                value={formData.ngoName}
                onChange={handleChange}
                className="eco-input"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label className="eco-label" htmlFor="ngo-contact">👤 Contact Person</label>
                <input
                  id="ngo-contact"
                  type="text"
                  name="contactPerson"
                  placeholder="Primary contact name"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
              <div>
                <label className="eco-label" htmlFor="ngo-phone">📞 Phone Number</label>
                <input
                  id="ngo-phone"
                  type="tel"
                  name="phone"
                  placeholder="+91 xxx xxx xxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="eco-label" htmlFor="ngo-email">📧 Email Address</label>
              <input
                id="ngo-email"
                type="email"
                name="email"
                placeholder="contact@ngo.org"
                value={formData.email}
                onChange={handleChange}
                className="eco-input"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
              <div>
                <label className="eco-label" htmlFor="ngo-location">📍 Location / Area</label>
                <input
                  id="ngo-location"
                  type="text"
                  name="location"
                  placeholder="City or neighborhood"
                  value={formData.location}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
              <div>
                <label className="eco-label" htmlFor="ngo-capacity">👥 Capacity</label>
                <input
                  id="ngo-capacity"
                  type="number"
                  name="capacity"
                  placeholder="Servings/day"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
            </div>

            <div style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.15)",
              borderRadius: "10px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>🤖</span>
              <p style={{ color: "#93c5fd", fontSize: "0.83rem", margin: 0 }}>
                AI will automatically match food donations from nearby locations to this NGO based on capacity and area.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                type="submit"
                className="btn-secondary"
                disabled={loading}
                style={{
                  flex: 1, padding: "14px", fontSize: "1rem",
                  opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px", borderTopColor: "#fff" }} />
                    Registering...
                  </>
                ) : (
                  "🏢 Register NGO"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/ngos")}
                style={{
                  padding: "14px 24px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNGO;