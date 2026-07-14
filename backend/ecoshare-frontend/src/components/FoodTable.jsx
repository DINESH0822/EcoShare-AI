import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getSortedNGOs } from "../utils/distance";

function FoodTable() {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [claiming, setClaiming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userRole = userInfo?.role;

  useEffect(() => {
    const baseUrl = window.location.hostname === "localhost" 
      ? "http://localhost:5000" 
      : "https://ecoshare-ai.onrender.com";

    Promise.all([
      axios.get(`${baseUrl}/api/food`),
      axios.get(`${baseUrl}/api/ngo`),
      axios.get(`${baseUrl}/api/config`),
    ])
      .then(([foodRes, ngoRes, configRes]) => {
        setFoods(foodRes.data);
        setNgos(ngoRes.data);
        setGoogleMapsApiKey(configRes.data.googleMapsApiKey || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const claimFood = async (foodId, nearestNgoName) => {
    setClaiming(foodId);
    
    // Choose claiming NGO name:
    // If the logged-in user is an NGO, use their name.
    // If Admin, use the recommended/nearest NGO name.
    const ngoName = userRole === "NGO" ? (userInfo?.name || "Helping Hands") : (nearestNgoName || "Helping Hands");

    try {
      const baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://ecoshare-ai.onrender.com";

      await axios.post(`${baseUrl}/api/claim`, {
        foodId,
        ngoName,
      });

      toast.success(`✅ Food claimed by ${ngoName}!`, {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });

      setFoods((prev) =>
        prev.map((f) => (f._id === foodId ? { ...f, status: "Claimed", claimedBy: ngoName } : f))
      );
    } catch (err) {
      console.error(err);
      toast.error("Claim failed", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setClaiming(null);
    }
  };

  const deleteFood = async (foodId) => {
    const ok = window.confirm("Are you sure you want to remove this food donation?");
    if (!ok) return;

    setDeleting(foodId);
    try {
      const baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://ecoshare-ai.onrender.com";

      await axios.delete(`${baseUrl}/api/food/${foodId}`);
      toast.success("Donation removed successfully", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      setFoods((prev) => prev.filter((f) => f._id !== foodId));
    } catch (err) {
      console.error(err);
      toast.error("Delete failed", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px", marginTop: "20px" }}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-card" style={{ height: "380px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "60%", height: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
              <div style={{ width: "30%", height: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }} />
            </div>
            <div style={{ width: "80%", height: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "4px" }} />
            <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: "10px" }} />
            <div style={{ width: "100%", height: "40px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
          </div>
        ))}
      </div>
    );
  }

  const filteredFoods = foods
    .filter((food) => {
      const query = search.toLowerCase();
      return (
        food.foodName?.toLowerCase().includes(query) ||
        food.donorName?.toLowerCase().includes(query) ||
        food.address?.toLowerCase().includes(query) ||
        food.city?.toLowerCase().includes(query) ||
        food.location?.toLowerCase().includes(query)
      );
    })
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
            🍱 Food Donations Grid
          </h2>
          <p style={{ color: "#475569", fontSize: "0.8rem", margin: 0 }}>
            Showing {filteredFoods.length} items {filter !== "All" ? `(${filter})` : "total"}
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
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <span style={{
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
          fontSize: "15px", pointerEvents: "none",
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search by food, hotel/donor, city or pincode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="eco-input"
          style={{ paddingLeft: "42px" }}
        />
      </div>

      {/* Grid of Cards */}
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "24px",
        }}>
          {filteredFoods.map((food) => {
            const isExpired = new Date(food.expiryTime) < new Date();
            
            // AI Distance Sorting to all NGOs
            const sortedNgos = getSortedNGOs(food.latitude, food.longitude, ngos);
            const recommendedNgo = sortedNgos[0];

            const expiryDate = new Date(food.expiryTime);
            const expiryStr = isNaN(expiryDate) ? "—" : expiryDate.toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit"
            }) + " (" + expiryDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + ")";

            // Format coordinates & maps URLs
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${food.latitude || 0},${food.longitude || 0}`;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${food.latitude || 0},${food.longitude || 0}`;
            const cleanPhone = food.phone ? food.phone.replace(/\D/g, "") : "";
            const waUrl = `https://wa.me/91${cleanPhone}`;

            // Map preview url (Google Maps Embed or OpenStreetMap)
            const mapEmbedUrl = googleMapsApiKey
              ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${food.latitude || 0},${food.longitude || 0}&zoom=15`
              : `https://www.openstreetmap.org/export/embed.html?bbox=${(food.longitude || 0) - 0.003}%2C${(food.latitude || 0) - 0.003}%2C${(food.longitude || 0) + 0.003}%2C${(food.latitude || 0) + 0.003}&layer=mapnik&marker=${food.latitude || 0}%2C${food.longitude || 0}`;

            return (
              <div 
                key={food._id} 
                className="glass-card fade-in" 
                style={{
                  display: "flex", flexDirection: "column", padding: "20px", 
                  transition: "all 0.3s ease", border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f0f9ff", margin: 0 }}>
                      🍱 {food.foodName}
                    </h3>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                      by <strong>{food.donorName}</strong> ({food.donorType})
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    {food.status === "Claimed" ? (
                      <span className="badge-claimed">Claimed</span>
                    ) : isExpired ? (
                      <span className="badge-expired">Expired</span>
                    ) : (
                      <span className="badge-available">Available</span>
                    )}
                    <span style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8"
                    }}>
                      ⚖️ {food.quantity} Servings
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                  {/* Phone */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#94a3b8" }}>
                    <span>📞 Contact:</span>
                    <strong style={{ color: "#cbd5e1" }}>+91 {food.phone}</strong>
                    {food.phoneVerified ? (
                      <span style={{ fontSize: "0.72rem", background: "rgba(16,185,129,0.12)", color: "#34d399", padding: "1px 6px", borderRadius: "10px", border: "1px solid rgba(16,185,129,0.3)", fontWeight: "700" }}>
                        ✓ Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.72rem", background: "rgba(239,68,68,0.12)", color: "#f87171", padding: "1px 6px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.3)" }}>
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Expiry */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#94a3b8" }}>
                    <span>⏰ Expiry:</span>
                    <strong style={{ color: isExpired ? "#f87171" : "#cbd5e1" }}>{expiryStr}</strong>
                  </div>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.8rem", color: "#94a3b8", minHeight: "36px" }}>
                    <span style={{ whiteSpace: "nowrap" }}>📍 Address:</span>
                    <span style={{ color: "#cbd5e1", lineHeight: 1.3 }}>{food.address || food.location}</span>
                  </div>
                </div>

                {/* Mini Google Map Preview */}
                {food.latitude && food.longitude ? (
                  <div style={{
                    width: "100%", height: "130px", borderRadius: "10px", overflow: "hidden", 
                    border: "1px solid rgba(255,255,255,0.06)", marginBottom: "14px"
                  }}>
                    <iframe
                      title={`map-${food._id}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: "brightness(0.85) contrast(1.1) invert(0.03)" }}
                      loading="lazy"
                      src={mapEmbedUrl}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: "100%", height: "130px", borderRadius: "10px", background: "rgba(255,255,255,0.02)",
                    border: "1px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", color: "#475569", marginBottom: "14px"
                  }}>
                    🗺️ GPS location unavailable
                  </div>
                )}

                {/* AI Distance Matching Section */}
                <div style={{
                  padding: "10px 12px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
                  borderRadius: "8px", marginBottom: "14px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#c4b5fd", fontWeight: "700" }}>🤖 AI Distance Match</span>
                    {recommendedNgo && (
                      <span style={{ fontSize: "0.68rem", background: "rgba(139,92,246,0.2)", color: "#d8b4fe", padding: "1px 6px", borderRadius: "8px", fontWeight: "700" }}>
                        Nearest
                      </span>
                    )}
                  </div>

                  {sortedNgos.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {sortedNgos.slice(0, 3).map((ngo, index) => (
                        <div key={ngo._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: index === 0 ? "#cbd5e1" : "#64748b" }}>
                          <span>{index + 1}. {ngo.ngoName}</span>
                          <strong style={{ color: index === 0 ? "#a78bfa" : "#64748b" }}>{ngo.distance} km</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>No NGOs active nearby.</div>
                  )}
                </div>

                {/* Communications Row */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  <a href={`tel:${cleanPhone}`} style={{ flex: 1, textDecoration: "none" }}>
                    <button
                      type="button"
                      style={{
                        width: "100%", padding: "8px 0", background: "rgba(16,185,129,0.04)", 
                        border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", color: "#34d399",
                        fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", 
                        alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.04)"; }}
                    >
                      📞 Call Donor
                    </button>
                  </a>
                  <a href={waUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                    <button
                      type="button"
                      style={{
                        width: "100%", padding: "8px 0", background: "rgba(37,211,102,0.04)", 
                        border: "1px solid rgba(37,211,102,0.2)", borderRadius: "8px", color: "#25d366",
                        fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", 
                        alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,211,102,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,211,102,0.04)"; }}
                    >
                      💬 WhatsApp
                    </button>
                  </a>
                </div>

                {/* Map Directions Buttons */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                    <button
                      type="button"
                      style={{
                        width: "100%", padding: "8px 0", background: "rgba(255,255,255,0.02)", 
                        border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#94a3b8",
                        fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    >
                      🗺️ Open Map
                    </button>
                  </a>
                  <a href={directionsUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                    <button
                      type="button"
                      style={{
                        width: "100%", padding: "8px 0", background: "rgba(59,130,246,0.04)", 
                        border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", color: "#60a5fa",
                        fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.04)"; }}
                    >
                      🧭 Directions
                    </button>
                  </a>
                </div>

                <div style={{ flexGrow: 1 }} />

                {/* Primary Action Buttons (Claim / Delete) */}
                <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                  {(userRole === "Admin" || userRole === "NGO") && (
                    <button
                      onClick={() => claimFood(food._id, recommendedNgo?.ngoName)}
                      disabled={food.status === "Claimed" || isExpired || claiming === food._id}
                      className="btn-claim"
                      style={{
                        flex: 1, padding: "10px", fontSize: "0.85rem",
                        background: food.status === "Claimed" ? "rgba(245,158,11,0.08)" : undefined,
                        border: food.status === "Claimed" ? "1px solid rgba(245,158,11,0.15)" : undefined,
                        color: food.status === "Claimed" ? "#fbbf24" : undefined,
                        opacity: (claiming === food._id || isExpired) ? 0.6 : 1,
                        cursor: (food.status === "Claimed" || isExpired) ? "not-allowed" : "pointer"
                      }}
                    >
                      {claiming === food._id ? "..." : food.status === "Claimed" ? `Claimed by ${food.claimedBy}` : "Claim Donation"}
                    </button>
                  )}
                  {userRole === "Admin" && (
                    <button
                      onClick={() => deleteFood(food._id)}
                      disabled={deleting === food._id}
                      className="btn-danger"
                      style={{
                        padding: "10px 14px", fontSize: "0.85rem",
                        opacity: deleting === food._id ? 0.6 : 1,
                        cursor: deleting === food._id ? "not-allowed" : "pointer"
                      }}
                    >
                      {deleting === food._id ? "..." : "🗑️"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FoodTable;