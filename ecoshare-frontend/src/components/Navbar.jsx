import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../config/AuthContext";
import { useSocket } from "../config/SocketContext";
import {
  Bell, LogOut, Menu, X, Check, Leaf, ChevronDown,
  Search, LayoutGrid, PackageSearch, Building2, Truck,
  BarChart3, History, ShieldCheck, Settings, Bot, MapPinned
} from "lucide-react";

function Navbar({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const notiRef = useRef(null);
  const moreRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();

  const userRole = user?.role;
  const userName = user?.name ? user.name.split(" ")[0] : "Account";

  const isActive = (path) => location.pathname === path;

  const primaryLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/donations", label: "Donations", icon: PackageSearch },
    { to: "/organizations", label: "Organizations", icon: Building2 },
    { to: "/operations", label: "Operations", icon: Truck },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  const secondaryLinks = [
    { to: "/history", label: "History", icon: History },
    ...(userRole === "Admin" ? [
      { to: "/admin", label: "Admin", icon: ShieldCheck },
      { to: "/integrations", label: "Integrations", icon: Settings },
    ] : []),
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Link to="/" className="brand-lockup no-underline">
            <div className="brand-mark">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="brand-name">EcoShare AI</div>
              <div className="brand-subtitle">FOOD RESCUE NETWORK</div>
            </div>
          </Link>

          <nav className="sidebar-nav" aria-label="Main navigation">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-item ${isActive(link.to) ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-label">Insights</div>
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-item nav-item--muted ${isActive(link.to) ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="ecobot-mini">
            <div className="ecobot-mini__icon"><Bot className="w-4 h-4" /></div>
            <div>
              <div className="ecobot-mini__title">EcoBot AI</div>
              <div className="ecobot-mini__status">Online</div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="profile-avatar">{userName[0]}</div>
            <div className="profile-meta">
              <span className="profile-name">{userName}</span>
              <span className="profile-role">{userRole || "Member"}</span>
            </div>
          </div>

          <button onClick={logout} className="sidebar-logout" aria-label="Log out">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="search-wrap">
              <Search className="w-4 h-4 search-icon" />
              <input
                className="global-search"
                type="text"
                placeholder="Search donations, organizations, locations..."
                aria-label="Global search"
              />
              <span className="keycap">Ctrl K</span>
            </div>

            <div className="topbar-actions">
              <button className="icon-button-soft" type="button" aria-label="Notifications">
                <Bell className="w-4 h-4" />
              </button>
              <div className="profile-box profile-box--compact">
                <div className="profile-avatar">{userName[0]}</div>
                <div className="profile-meta">
                  <span className="profile-name">{userName}</span>
                  <span className="profile-role">{userRole || "Admin"}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-surface">
          {children ? <div className="page-body">{children}</div> : null}
          {menuOpen && (
            <div className="mobile-menu">
              {primaryLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={`mobile-menu-item ${isActive(link.to) ? "active" : ""}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;