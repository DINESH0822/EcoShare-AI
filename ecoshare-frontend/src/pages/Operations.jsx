import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import DashboardMap from "../components/DashboardMap";
import { useDemo } from "../config/DemoContext";
import { Truck, ArrowRight, MapPin, Clock3, UserRound, Route } from "lucide-react";

const DEMO_OPERATIONS = [
  {
    _id: "507f1f77bcf86cd799439011",
    status: "en_route",
    assignedNgoName: "Robin Hood Army",
    volunteerName: "Rajesh",
    eta: "18 min",
    distance: "12.4 km",
    foodId: {
      foodName: "Excess Catering Rice & Paneer",
      quantity: 120,
      address: "BKC Expressway, Bandra East, Mumbai",
      latitude: 19.065,
      longitude: 72.868
    },
    updatedAt: new Date().toISOString()
  },
  {
    _id: "5f1b7c77bcf86cd799439022",
    status: "claimed",
    assignedNgoName: "Roti Bank Foundation",
    volunteerName: "Asha",
    eta: "28 min",
    distance: "9.1 km",
    foodId: {
      foodName: "Fresh Bakery Surplus",
      quantity: 45,
      address: "FC Road, Shivaji Nagar, Pune",
      latitude: 18.520,
      longitude: 73.856
    },
    updatedAt: new Date().toISOString()
  },
  {
    _id: "64b74f22bcf86cd799439033",
    status: "pickup_scheduled",
    assignedNgoName: "Feeding India",
    volunteerName: "Nikhil",
    eta: "42 min",
    distance: "16.8 km",
    foodId: {
      foodName: "Vegetable & Grain Packets",
      quantity: 80,
      address: "Powai Plaza, Mumbai",
      latitude: 19.119,
      longitude: 72.905
    },
    updatedAt: new Date().toISOString()
  }
];

export default function Operations() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStage, setActiveStage] = useState("all");
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchOperations();
  }, [isDemoMode]);

  const fetchOperations = async () => {
    setLoading(true);
    setError("");
    if (isDemoMode) {
      setOperations(DEMO_OPERATIONS);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/operations");
      const data = res.data?.data ?? res.data;
      setOperations(Array.isArray(data) ? data : []);
    } catch (err) {
      setOperations([]);
      setError(err.message || "Unable to load rescue operations from the backend.");
    } finally {
      setLoading(false);
    }
  };

  const safeOps = Array.isArray(operations) ? operations : [];

  const pipelineStages = [
    { key: "all", label: "All" },
    { key: "claimed", label: "Claimed" },
    { key: "scheduled", label: "Scheduled" },
    { key: "en_route", label: "En Route" },
    { key: "pickup", label: "Pickup" },
    { key: "delivered", label: "Delivered" }
  ];

  const filteredOps = safeOps.filter((op) => {
    if (activeStage === "all") return true;
    if (activeStage === "claimed") return op.status === "claimed";
    if (activeStage === "scheduled") return op.status === "pickup_scheduled";
    if (activeStage === "en_route") return op.status === "en_route";
    if (activeStage === "pickup") return op.status === "arrived" || op.status === "collected";
    if (activeStage === "delivered") return op.status === "completed" || op.status === "delivered";
    return true;
  });

  const kpis = [
    { label: "Active rescues", value: filteredOps.length || 0 },
    { label: "Urgent", value: filteredOps.filter((op) => op.status === "en_route").length || 0 },
    { label: "En route", value: filteredOps.filter((op) => op.status === "claimed" || op.status === "en_route").length || 0 },
    { label: "Delivered", value: filteredOps.filter((op) => op.status === "completed" || op.status === "delivered").length || 0 }
  ];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container page-container--tight">
        <header className="page-header page-header--split">
          <div>
            <p className="section-kicker">Rescue control center</p>
            <h1 className="text-page-title">Rescue Control Center</h1>
            <p className="text-body">Monitor active food rescue missions, pickups, and deliveries in real time.</p>
          </div>
          <Link to="/operations" className="btn-secondary btn-secondary--compact no-underline">Live overview</Link>
        </header>

        <section className="ops-kpi-grid">
          {kpis.map((item) => (
            <div key={item.label} className="ops-kpi-card">
              <span className="ops-kpi-card__label">{item.label}</span>
              <strong className="ops-kpi-card__value">{item.value}</strong>
            </div>
          ))}
        </section>

        <div className="ops-filter-bar">
          {pipelineStages.map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => setActiveStage(stage.key)}
              className={`ops-filter-button ${activeStage === stage.key ? "is-active" : ""}`}
            >
              {stage.label}
            </button>
          ))}
        </div>

        <section className="ops-workspace">
          <div className="ops-workspace__main">
            <div className="panel panel--soft">
              <div className="panel-header panel-header--split">
                <div>
                  <p className="section-kicker">Dispatch queue</p>
                  <h3 className="section-title">Active rescue queue</h3>
                </div>
                <span className="live-pill">{filteredOps.length} operations</span>
              </div>

              {error && !loading ? (
                <div className="empty-state">
                  <div>
                    <h4>Unable to load rescue queue</h4>
                    <p>{error}</p>
                    <button type="button" onClick={fetchOperations} className="btn-secondary mt-3">Retry</button>
                  </div>
                </div>
              ) : loading ? (
                <div className="empty-state">
                  <div>
                    <h4>Loading rescue queue</h4>
                    <p>Checking live operations and volunteer dispatch status.</p>
                  </div>
                </div>
              ) : filteredOps.length === 0 ? (
                <div className="empty-state">
                  <div>
                    <h4>No active rescue missions</h4>
                    <p>There are currently no operations matching this stage.</p>
                  </div>
                </div>
              ) : (
                <div className="rescue-card-list">
                  {filteredOps.map((op) => {
                    const organizationName = op.ngoId?.ngoName || op.ngoName || "NGO not assigned";
                    const volunteerName = op.volunteerId?.name || op.volunteerName || "Unassigned";
                    const eta = Number(op.estimatedDuration) > 0 ? `${op.estimatedDuration} min` : "Not recorded";
                    const distance = Number(op.estimatedDistance) > 0 ? `${op.estimatedDistance} km` : "Not recorded";
                    const updatedAt = op.updatedAt ? new Date(op.updatedAt).toLocaleString() : "Time not recorded";

                    return (
                    <article key={op._id} className="rescue-card">
                      <div className="rescue-card__topline">
                        <span className={`status-badge ${op.status === "en_route" ? "status-badge--success" : op.status === "claimed" ? "status-badge--primary" : "status-badge--danger"}`}>
                          {op.status === "en_route" ? "en route" : op.status === "claimed" ? "claimed" : op.status === "pickup_scheduled" ? "scheduled" : op.status}
                        </span>
                        <span className="rescue-card__id">#{op._id}</span>
                      </div>

                      <h4>{op.foodId?.foodName || "Food Rescue"}</h4>

                      <div className="rescue-card__meta">
                        <span><Truck className="w-4 h-4" /> {op.foodId?.quantity ?? op.quantity ?? "Not set"} {op.foodId?.quantityUnit || "servings"}</span>
                        <span><MapPin className="w-4 h-4" /> {op.foodId?.address || op.pickupAddress || "Pickup location not provided"}</span>
                      </div>

                      <div className="rescue-card__grid">
                        <div>
                          <span className="rescue-card__label">NGO</span>
                          <strong>{organizationName}</strong>
                        </div>
                        <div>
                          <span className="rescue-card__label">Volunteer</span>
                          <strong>{volunteerName}</strong>
                        </div>
                        <div>
                          <span className="rescue-card__label">ETA</span>
                          <strong>{eta}</strong>
                        </div>
                        <div>
                          <span className="rescue-card__label">Distance</span>
                          <strong>{distance}</strong>
                        </div>
                      </div>

                      <div className="rescue-card__footer">
                        <div className="rescue-card__status">
                          <Clock3 className="w-4 h-4" /> {updatedAt}
                        </div>
                        <div className="rescue-card__actions">
                          <Link to={`/operations/${op._id}`} className="btn-secondary btn-secondary--small no-underline">Track</Link>
                          <Link to={`/operations/${op._id}`} className="btn-primary btn-primary--small no-underline">Details</Link>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <aside className="ops-workspace__map">
            <div className="panel map-panel">
              <div className="panel-header panel-header--split">
                <div>
                  <p className="section-kicker">Network map</p>
                  <h3 className="section-title">Live route view</h3>
                </div>
                <span className="live-pill">Online</span>
              </div>
              <DashboardMap heightClass="h-[560px]" />
            </div>
          </aside>
        </section>
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
