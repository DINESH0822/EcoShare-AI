import { useEffect, useState } from "react";
import axios from "axios";
import FoodTable from "../components/FoodTable";
import Navbar from "../components/Navbar";
import DashboardChart from "../components/DashboardChart";
import DashboardMap from "../components/DashboardMap";
import { Link } from "react-router-dom";

function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userRole = userInfo?.role;

  useEffect(() => {
    const baseUrl = window.location.hostname === "localhost" 
      ? "http://localhost:5000" 
      : "https://ecoshare-ai.onrender.com";

    Promise.all([
      axios.get(`${baseUrl}/api/food`),
      axios.get(`${baseUrl}/api/ngo`),
    ])
      .then(([foodRes, ngoRes]) => {
        setFoods(foodRes.data);
        setNgos(ngoRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const foodCount = foods.length;
  const claimedCount = foods.filter((f) => f.status === "Claimed").length;
  const ngoCount = ngos.length;
  const availableCount = foodCount - claimedCount;
  const claimRate = foodCount > 0 ? Math.round((claimedCount / foodCount) * 100) : 0;

  const stats = [
    {
      label: "Food Donations",
      value: foodCount,
      icon: "🍱",
      color: "green",
      accent: "#10b981",
      sub: `${availableCount} available`,
      link: "/",
    },
    {
      label: "Registered NGOs",
      value: ngoCount,
      icon: "🏢",
      color: "blue",
      accent: "#3b82f6",
      sub: "Active partners",
      link: "/ngos",
    },
    {
      label: "Foods Claimed",
      value: claimedCount,
      icon: "✅",
      color: "gold",
      accent: "#f59e0b",
      sub: `${claimRate}% claim rate`,
      link: "/history",
    },
    {
      label: "AI Efficiency",
      value: `${claimRate}%`,
      icon: "🤖",
      color: "purple",
      accent: "#8b5cf6",
      sub: "Match accuracy",
      link: "/",
    },
  ];

  return (
    <div className="eco-bg" style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Navbar />

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Hero header */}
        <div className="fade-in" style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifycontent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                  color: "#34d399", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700",
                  letterSpacing: "0.5px",
                }}>🟢 LIVE DASHBOARD</span>
              </div>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "2.6rem", fontWeight: "900", margin: 0, marginBottom: "8px",
                lineHeight: 1.15,
              }}>
                <span style={{
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>EcoShare</span>
                {" "}
                <span style={{ color: "#f0f9ff" }}>AI</span>
              </h1>
              <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>
                AI-powered food donation platform · Reducing waste, ending hunger
              </p>
            </div>

            {(userRole === "Admin" || userRole === "Donor") && (
              <Link to="/add-food" style={{ textDecoration: "none", marginLeft: "auto" }}>
                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  🍱 Add Food Donation
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "32px",
            }}>
              {stats.map((stat, i) => (
                <Link key={stat.label} to={stat.link} style={{ textDecoration: "none" }}>
                  <div
                    className={`stat-card ${stat.color} fade-in` }
                    style={{ cursor: "pointer", animationDelay: `${i * 0.1}s` }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <div style={{
                        width: "46px", height: "46px",
                        background: `${stat.accent}20`,
                        border: `1px solid ${stat.accent}30`,
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                      }}>{stat.icon}</div>
                      <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: stat.accent,
                        boxShadow: `0 0 8px ${stat.accent}`,
                        marginTop: "6px",
                      }} />
                    </div>
                    <div style={{ fontSize: "2.4rem", fontWeight: "800", color: stat.accent, fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600", marginTop: "6px" }}>{stat.label}</div>
                    <div style={{ color: "#475569", fontSize: "0.78rem", marginTop: "4px" }}>{stat.sub}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "rgba(16,185,129,0.04)",
              border: "1px solid rgba(16,185,129,0.12)",
              borderRadius: "14px",
              padding: "20px 24px",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "0.82rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Quick Actions
              </span>
              {userRole === "Admin" || userRole === "Donor" ? (
                <Link to="/add-food" style={{ textDecoration: "none" }}>
                  <span className="info-tag" style={{ cursor: "pointer" }}>🍱 Add Food</span>
                </Link>
              ) : null}
              {userRole === "Admin" ? (
                <Link to="/add-ngo" style={{ textDecoration: "none" }}>
                  <span className="info-tag" style={{ cursor: "pointer", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#c4b5fd" }}>🏢 Add NGO</span>
                </Link>
              ) : null}
              <Link to="/ngos" style={{ textDecoration: "none" }}>
                <span className="info-tag" style={{ cursor: "pointer" }}>🌿 View NGOs</span>
              </Link>
              <Link to="/history" style={{ textDecoration: "none" }}>
                <span className="info-tag" style={{ cursor: "pointer", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#fbbf24" }}>📋 History</span>
              </Link>
            </div>

            {/* Live Interactive Unified Map */}
            <DashboardMap foods={foods} ngos={ngos} />

            {/* Donation Grid cards list */}
            <FoodTable />

            <DashboardChart
              foodCount={foodCount}
              ngoCount={ngoCount}
              claimedCount={claimedCount}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;