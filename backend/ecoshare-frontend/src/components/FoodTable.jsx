import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function FoodTable() {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [claiming, setClaiming] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userRole = userInfo?.role;

  useEffect(() => {
    Promise.all([
      axios.get("https://ecoshare-ai.onrender.com/api/food"),
      axios.get("https://ecoshare-ai.onrender.com/api/ngo"),
    ])
      .then(([foodRes, ngoRes]) => {
        setFoods(foodRes.data);
        setNgos(ngoRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const claimFood = async (foodId) => {
    setClaiming(foodId);
    try {
      await axios.post("https://ecoshare-ai.onrender.com/api/claim", {
        foodId,
        ngoName: "Helping Hands",
      });
      toast.success("✅ Food claimed successfully!", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      // Update in-place
      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, status: "Claimed" } : f))
      );
    } catch {
      toast.error("Claim failed", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setClaiming(null);
    }
  };

  const deleteFood = async (foodId) => {
    const ok = window.confirm("Delete this food donation?");
    if (!ok) return;

    setDeleting(foodId);
    try {
      await axios.delete(`https://ecoshare-ai.onrender.com/api/food/${foodId}`);
      toast.success("Donation removed", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      setFoods((prev) => prev.filter((f) => f._id !== foodId));
    } catch {
      toast.error("Delete failed", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
        <div className="spinner" />
      </div>
    );
  }

  const filteredFoods = foods
    .filter((food) =>
      food.location?.toLowerCase().includes(search.toLowerCase()) ||
      food.foodName?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((food) => {
      const isExpired = new Date(food.expiryTime) < new Date();
      if (filter === "All") return true;
      if (filter === "Claimed") return food.status === "Claimed";
      if (filter === "Expired") return isExpired;
      if (filter === "Available") return food.status === "Available" && !isExpired;
      return true;
    });

  return (
    <div style={{ marginTop: "12px" }}>

      {/* Section header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.4rem", fontWeight: "800",
            margin: 0, color: "#f0f9ff",
          }}>
            🍱 Food Donations
          </h2>
          <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>
            {filteredFoods.length} items {filter !== "All" ? `(${filter})` : "total"}
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["All", "Available", "Claimed", "Expired"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: filter === f ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: filter === f
                  ? f === "Available" ? "linear-gradient(135deg,#10b981,#059669)"
                  : f === "Claimed" ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : f === "Expired" ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : "linear-gradient(135deg,#3b82f6,#2563eb)"
                  : "rgba(255,255,255,0.04)",
                color: filter === f ? "#fff" : "#94a3b8",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <span style={{
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
          fontSize: "15px", pointerEvents: "none",
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search by food name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="eco-input"
          style={{ paddingLeft: "42px" }}
        />
      </div>

      {/* Table */}
      {filteredFoods.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px",
          background: "rgba(13,31,60,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px",
          color: "#475569",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🍽️</div>
          <p style={{ fontWeight: "600", color: "#64748b" }}>No food donations found</p>
        </div>
      ) : (
        <div style={{
          background: "rgba(13,31,60,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          overflow: "auto",
        }}>
          <table className="eco-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: "20px" }}>Food Item</th>
                <th>Qty</th>
                <th>Location / AI Match</th>
                <th>Expires</th>
                <th>Status</th>
                {(userRole === "Admin" || userRole === "NGO") && <th>Claim</th>}
                {userRole === "Admin" && <th>Delete</th>}
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => {
                const isExpired = new Date(food.expiryTime) < new Date();
                const recommendedNGO = ngos.find(
                  (ngo) =>
                    ngo.location?.toLowerCase() === food.location?.toLowerCase()
                );
                const expiryDate = new Date(food.expiryTime);
                const expiryStr = isNaN(expiryDate) ? "—" : expiryDate.toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                });

                return (
                  <tr key={food._id}>
                    <td style={{ paddingLeft: "20px" }}>
                      <div style={{ fontWeight: "700", color: "#f0f9ff", fontSize: "0.92rem" }}>
                        {food.foodName}
                      </div>
                      {food.donorName && (
                        <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "2px" }}>
                          by {food.donorName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "6px",
                        padding: "3px 10px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        color: "#94a3b8",
                      }}>{food.quantity}</span>
                    </td>
                    <td>
                      <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                        <span style={{ marginRight: "4px" }}>📍</span>{food.location}
                      </div>
                      {recommendedNGO && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          marginTop: "4px",
                          background: "rgba(139,92,246,0.1)",
                          border: "1px solid rgba(139,92,246,0.2)",
                          color: "#c4b5fd",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.72rem",
                          fontWeight: "600",
                        }}>
                          🤖 {recommendedNGO.ngoName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.82rem",
                        color: isExpired ? "#f87171" : "#94a3b8",
                        fontWeight: isExpired ? "700" : "400",
                      }}>
                        {expiryStr}
                      </span>
                    </td>
                    <td>
                      {food.status === "Claimed" ? (
                        <span className="badge-claimed">Claimed</span>
                      ) : isExpired ? (
                        <span className="badge-expired">Expired</span>
                      ) : (
                        <span className="badge-available">Available</span>
                      )}
                    </td>
                    {(userRole === "Admin" || userRole === "NGO") && (
                      <td>
                        {food.status === "Claimed" ? (
                          <span style={{ color: "#475569", fontSize: "0.8rem" }}>—</span>
                        ) : isExpired ? (
                          <span style={{ color: "#475569", fontSize: "0.8rem" }}>—</span>
                        ) : (
                          <button
                            className="btn-claim"
                            onClick={() => claimFood(food._id)}
                            disabled={claiming === food._id}
                            style={{ opacity: claiming === food._id ? 0.6 : 1 }}
                          >
                            {claiming === food._id ? "..." : "Claim"}
                          </button>
                        )}
                      </td>
                    )}
                    {userRole === "Admin" && (
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => deleteFood(food._id)}
                          disabled={deleting === food._id}
                          style={{ opacity: deleting === food._id ? 0.6 : 1 }}
                        >
                          {deleting === food._id ? "..." : "Delete"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#475569",
            fontSize: "0.8rem",
          }}>
            <span>{filteredFoods.length} items shown</span>
            <span>🤖 AI NGO matching active</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodTable;