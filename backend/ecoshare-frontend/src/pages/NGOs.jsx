import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function NGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userRole = userInfo?.role;

  useEffect(() => {
    const baseUrl = window.location.hostname === "localhost" 
      ? "http://localhost:5000" 
      : "https://ecoshare-ai.onrender.com";

    Promise.all([
      axios.get(`${baseUrl}/api/ngo`),
      axios.get(`${baseUrl}/api/config`)
    ])
      .then(([ngoRes, configRes]) => {
        setNgos(ngoRes.data);
        setGoogleMapsApiKey(configRes.data.googleMapsApiKey || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const deleteNGO = async (ngoId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this NGO partner?");
    if (!confirmDelete) return;

    setDeleting(ngoId);
    try {
      const baseUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://ecoshare-ai.onrender.com";

      await axios.delete(`${baseUrl}/api/ngo/${ngoId}`);
      toast.success("NGO removed successfully", {
        style: { background: "#0d1f3c", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" },
      });
      setNgos((prev) => prev.filter((n) => n._id !== ngoId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete NGO", {
        style: { background: "#0d1f3c", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
      });
    } finally {
      setDeleting(null);
    }
  };

  const filtered = ngos.filter((ngo) =>
    ngo.ngoName?.toLowerCase().includes(search.toLowerCase()) ||
    ngo.address?.toLowerCase().includes(search.toLowerCase()) ||
    ngo.location?.toLowerCase().includes(search.toLowerCase())
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
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
                boxShadow: "0 0 18px rgba(59,130,246,0.3)",
              }}>🌿</div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "2rem", fontWeight: "800", margin: 0,
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>NGO Partners</h1>
            </div>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.88rem" }}>
              {ngos.length} registered organizations in the EcoShare network
            </p>
          </div>
          {userRole === "Admin" && (
            <Link to="/add-ngo" style={{ textDecoration: "none" }}>
              <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                ➕ Add NGO
              </button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="fade-in" style={{ marginBottom: "28px", position: "relative" }}>
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontSize: "16px", pointerEvents: "none",
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, location or address..."
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
          <div style={{
            textAlign: "center", padding: "80px 20px",
            color: "#475569",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌿</div>
            <p style={{ fontSize: "1.1rem", fontWeight: "600", color: "#64748b" }}>
              {search ? "No NGOs match your search" : "No NGOs registered yet"}
            </p>
            <p style={{ fontSize: "0.88rem", marginTop: "8px" }}>
              {userRole === "Admin" && !search && "Register the first NGO to get started"}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "24px",
          }}>
            {filtered.map((ngo, i) => {
              const cleanPhone = ngo.phone ? ngo.phone.replace(/\D/g, "") : "";
              const waUrl = `https://wa.me/91${cleanPhone}`;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${ngo.latitude || 0},${ngo.longitude || 0}`;

              // Map URL configuration
              const mapEmbedUrl = googleMapsApiKey
                ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${ngo.latitude || 0},${ngo.longitude || 0}&zoom=15`
                : `https://www.openstreetmap.org/export/embed.html?bbox=${(ngo.longitude || 0) - 0.003}%2C${(ngo.latitude || 0) - 0.003}%2C${(ngo.longitude || 0) + 0.003}%2C${(ngo.latitude || 0) + 0.003}&layer=mapnik&marker=${ngo.latitude || 0}%2C${ngo.longitude || 0}`;

              return (
                <div
                  key={ngo._id}
                  className="ngo-card fade-in"
                  style={{ animationDelay: `${i * 0.06}s`, display: "flex", flexDirection: "column" }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "46px", height: "46px",
                        background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                        border: "1px solid rgba(59,130,246,0.2)",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                      }}>🏢</div>
                      <div>
                        <h2 style={{
                          fontSize: "1.05rem", fontWeight: "700", margin: 0,
                          color: "#f0f9ff",
                        }}>{ngo.ngoName}</h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                          <span style={{ fontSize: "11px" }}>📍</span>
                          <span style={{ color: "#64748b", fontSize: "0.8rem" }}>{ngo.address || ngo.location}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      color: "#34d399",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "0.72rem",
                      fontWeight: "700",
                    }}>Active</span>
                  </div>

                  {/* Info rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    {[
                      { icon: "👤", label: "Contact", val: ngo.contactPerson },
                      { icon: "📞", label: "Phone", val: `+91 ${ngo.phone}` },
                      { icon: "📧", label: "Email", val: ngo.email },
                      { icon: "👥", label: "Capacity", val: `${ngo.capacity} servings/day` },
                    ].map(({ icon, label, val }) => (
                      <div key={label} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: "8px",
                      }}>
                        <span style={{ fontSize: "13px", minWidth: "18px" }}>{icon}</span>
                        <span style={{ color: "#475569", fontSize: "0.78rem", minWidth: "56px" }}>{label}</span>
                        <span style={{ color: "#cbd5e1", fontSize: "0.85rem", fontWeight: "500" }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Mini Map Preview */}
                  {ngo.latitude && ngo.longitude ? (
                    <div style={{
                      width: "100%", height: "120px", borderRadius: "10px", overflow: "hidden", 
                      border: "1px solid rgba(255,255,255,0.06)", marginBottom: "14px"
                    }}>
                      <iframe
                        title={`ngo-map-${ngo._id}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "brightness(0.85) contrast(1.1) invert(0.03)" }}
                        loading="lazy"
                        src={mapEmbedUrl}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: "100%", height: "120px", borderRadius: "10px", background: "rgba(255,255,255,0.02)",
                      border: "1px dashed rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.75rem", color: "#475569", marginBottom: "14px"
                    }}>
                      🗺️ GPS HQ location unset
                    </div>
                  )}

                  {/* Call/WhatsApp NGO Shortcuts */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                    <a href={`tel:${cleanPhone}`} style={{ flex: 1, textDecoration: "none" }}>
                      <button
                        type="button"
                        style={{
                          width: "100%", padding: "8px 0", background: "rgba(59,130,246,0.04)", 
                          border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", color: "#60a5fa",
                          fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", 
                          alignItems: "center", justifyContent: "center", gap: "6px", transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.15)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.04)"; }}
                      >
                        📞 Call NGO
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

                  <div style={{ flexGrow: 1 }} />

                  {/* AI matching text */}
                  <div style={{
                    background: "rgba(139,92,246,0.08)",
                    border: "1px solid rgba(139,92,246,0.15)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "14px",
                  }}>
                    <span style={{ fontSize: "13px" }}>🤖</span>
                    <span style={{ color: "#a78bfa", fontSize: "0.78rem" }}>
                      Active for GPS matching in <strong>{ngo.address ? ngo.address.split(",")[0] : ngo.location}</strong>
                    </span>
                  </div>

                  {userRole === "Admin" && (
                    <button
                      className="btn-danger"
                      onClick={() => deleteNGO(ngo._id)}
                      disabled={deleting === ngo._id}
                      style={{
                        width: "100%",
                        opacity: deleting === ngo._id ? 0.6 : 1,
                        cursor: deleting === ngo._id ? "not-allowed" : "pointer"
                      }}
                    >
                      {deleting === ngo._id ? "Removing..." : "🗑️ Remove NGO Partner"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default NGOs;