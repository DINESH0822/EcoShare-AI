import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AddFood() {
  const [formData, setFormData] = useState({
    foodName: "",
    quantity: "",
    donorName: "",
    donorType: "",
    location: "",
    expiryTime: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitFood = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("https://ecoshare-ai.onrender.com/api/food", formData);
      toast.success("🍱 Food donation added successfully!", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      setFormData({ foodName: "", quantity: "", donorName: "", donorType: "", location: "", expiryTime: "" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add food", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "foodName", label: "Food Name", type: "text", placeholder: "e.g. Rice, Vegetables, Bread", icon: "🍱" },
    { name: "quantity", label: "Quantity (servings/kg)", type: "number", placeholder: "e.g. 50", icon: "⚖️" },
    { name: "donorName", label: "Donor Name", type: "text", placeholder: "Your name or organization", icon: "👤" },
    { name: "donorType", label: "Donor Type", type: "text", placeholder: "e.g. Restaurant, Individual, Hotel", icon: "🏪" },
    { name: "location", label: "Pickup Location", type: "text", placeholder: "City or area name", icon: "📍" },
  ];

  return (
    <div className="eco-bg" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div className="fade-in" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{
              width: "48px", height: "48px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              borderRadius: "14px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 0 20px rgba(16,185,129,0.3)",
            }}>🍱</div>
            <div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.9rem", fontWeight: "800", margin: 0,
                background: "linear-gradient(135deg, #10b981, #34d399)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Add Food Donation</h1>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
                Share surplus food — AI will match it to nearby NGOs automatically
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="form-card fade-in fade-in-delay-1">
          {/* AI tip */}
          <div style={{
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <p style={{ color: "#c4b5fd", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
              <strong>AI Matching Active:</strong> Our system will automatically suggest the nearest NGO based on location and food type.
            </p>
          </div>

          <form onSubmit={submitFood} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="eco-label" htmlFor={`af-${field.name}`}>
                  <span style={{ marginRight: "6px" }}>{field.icon}</span>{field.label}
                </label>
                <input
                  id={`af-${field.name}`}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="eco-input"
                  required
                />
              </div>
            ))}

            {/* Expiry datetime */}
            <div>
              <label className="eco-label" htmlFor="af-expiryTime">
                ⏰ Expiry Date & Time
              </label>
              <input
                id="af-expiryTime"
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleChange}
                className="eco-input"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  flex: 1, padding: "14px", fontSize: "1rem",
                  opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                    Adding...
                  </>
                ) : (
                  "🍱 Add Donation"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  padding: "14px 24px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="fade-in fade-in-delay-2" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
          marginTop: "24px",
        }}>
          {[
            { icon: "📦", title: "Pack properly", desc: "Ensure food is sealed and safe for transport" },
            { icon: "📍", title: "Location accuracy", desc: "Accurate location helps NGOs reach you faster" },
            { icon: "⏱️", title: "Realistic expiry", desc: "Set accurate expiry to avoid waste" },
          ].map((tip) => (
            <div key={tip.title} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "16px",
            }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>{tip.icon}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>{tip.title}</div>
              <div style={{ color: "#475569", fontSize: "0.78rem" }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddFood;