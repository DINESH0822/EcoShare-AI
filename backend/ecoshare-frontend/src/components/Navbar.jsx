import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userRole = userInfo?.role;
  const userName = userInfo?.name;

  const logout = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Dashboard", icon: "📊", always: true },
    { to: "/add-food", label: "Add Food", icon: "🍱", roles: ["Admin", "Donor"] },
    { to: "/add-ngo", label: "Add NGO", icon: "🏢", roles: ["Admin"] },
    { to: "/ngos", label: "NGOs", icon: "🌿", always: true },
    { to: "/history", label: "History", icon: "📋", always: true },
  ];

  const visibleLinks = navLinks.filter(
    (link) => link.always || link.roles?.includes(userRole)
  );

  return (
    <nav style={{
      background: "rgba(6,18,38,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(16,185,129,0.12)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "0 24px",
    }}>
      <div style={{
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "68px",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 0 16px rgba(16,185,129,0.35)",
          }}>🌾</div>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.3rem",
            fontWeight: "800",
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.3px",
          }}>EcoShare <span style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", WebkitBackgroundClip:"text", backgroundClip:"text" }}>AI</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: isActive(link.to) ? "700" : "500",
                color: isActive(link.to) ? "#34d399" : "#94a3b8",
                background: isActive(link.to) ? "rgba(16,185,129,0.1)" : "transparent",
                border: isActive(link.to) ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={e => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "#f0f9ff";
                }
              }}
              onMouseLeave={e => {
                if (!isActive(link.to)) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }
              }}
            >
              <span style={{ fontSize: "14px" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Info + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.88rem", fontWeight: "700", color: "#34d399", margin: 0 }}>{userName}</p>
            <p style={{
              fontSize: "0.72rem", margin: 0,
              background: userRole === "Admin" ? "linear-gradient(90deg,#f59e0b,#ef4444)" : userRole === "NGO" ? "linear-gradient(90deg,#3b82f6,#8b5cf6)" : "linear-gradient(90deg,#10b981,#3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              fontWeight: "600", letterSpacing: "0.5px",
            }}>{userRole}</p>
          </div>
          <button
            onClick={logout}
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;