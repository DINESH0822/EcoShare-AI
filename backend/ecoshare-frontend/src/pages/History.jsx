import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("https://ecoshare-ai.onrender.com/api/history")
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = history.filter((h) =>
    h.foodName?.toLowerCase().includes(search.toLowerCase()) ||
    h.claimedBy?.toLowerCase().includes(search.toLowerCase()) ||
    h.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="eco-bg" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Navbar />
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div className="page-header fade-in">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{
                width: "44px", height: "44px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 0 18px rgba(245,158,11,0.3)",
              }}>📋</div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "2rem", fontWeight: "800", margin: 0,
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Claim History</h1>
            </div>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
              {history.length} total food items claimed through EcoShare AI
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "12px",
              padding: "12px 20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#34d399" }}>{history.length}</div>
              <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Claims</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="fade-in" style={{ marginBottom: "24px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontSize: "16px", pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by food name, NGO, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="eco-input"
            style={{ paddingLeft: "42px" }}
          />
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
            <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#64748b" }}>
              {search ? "No history matches your search" : "No claims recorded yet"}
            </p>
          </div>
        ) : (
          <div className="fade-in fade-in-delay-1" style={{
            background: "rgba(13,31,60,0.6)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            overflow: "hidden",
          }}>
            <table className="eco-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: "24px" }}>#</th>
                  <th>🍱 Food Item</th>
                  <th>🏢 Claimed By (NGO)</th>
                  <th>📍 Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item._id || i} className="history-row">
                    <td style={{ paddingLeft: "24px", color: "#475569", fontWeight: "600" }}>
                      {i + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#f0f9ff" }}>{item.foodName}</div>
                      {item.quantity && (
                        <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: "2px" }}>
                          Qty: {item.quantity}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                          width: "30px", height: "30px",
                          background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                          borderRadius: "8px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px",
                        }}>🏢</div>
                        <span style={{ color: "#93c5fd", fontWeight: "600" }}>{item.claimedBy}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "12px" }}>📍</span>
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-claimed">✅ Claimed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ color: "#475569", fontSize: "0.82rem" }}>
                Showing {filtered.length} of {history.length} records
              </span>
              <span style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)",
                color: "#34d399",
                padding: "4px 12px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: "600",
              }}>
                🤖 AI Matched
              </span>
            </div>
          </div>
        )}

        {/* Impact summary */}
        {history.length > 0 && !loading && (
          <div className="fade-in fade-in-delay-2" style={{
            marginTop: "24px",
            background: "rgba(16,185,129,0.04)",
            border: "1px solid rgba(16,185,129,0.12)",
            borderRadius: "14px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "24px" }}>🌍</span>
            <div>
              <p style={{ color: "#34d399", fontWeight: "700", margin: 0, fontSize: "0.95rem" }}>
                Community Impact
              </p>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.83rem" }}>
                <strong style={{ color: "#94a3b8" }}>{history.length} food donations</strong> successfully claimed through EcoShare AI — reducing waste and fighting hunger.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;