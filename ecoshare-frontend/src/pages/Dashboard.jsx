import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import DashboardMap from "../components/DashboardMap";
import MetricStrip from "../components/MetricStrip";
import ActivityFeed from "../components/ActivityFeed";
import RescueStatus from "../components/RescueStatus";
import AIRescueInsight from "../components/AIRescueInsight";
import DataTable from "../components/DataTable";
import EcoBot from "../components/EcoBot";
import { Link } from "react-router-dom";
import { useDemo } from "../config/DemoContext";
import { Plus } from "lucide-react";

function Dashboard() {
  const [foods, setFoods] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState("all");

  const { isDemoMode, demoDonations, demoNgos } = useDemo();

  useEffect(() => {
    fetchDashboardData();
  }, [isDemoMode]);

  const fetchDashboardData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setFoods(demoDonations);
      setNgos(demoNgos);
      setStatsData({ mealsSaved: 2480, activeDonations: 12, ngosCount: 18, completionRate: "94%", co2Saved: 420 });
      setLoading(false);
      return;
    }

    try {
      const [foodRes, ngoRes, analyticsRes] = await Promise.all([
        axios.get("/api/food"),
        axios.get("/api/ngo"),
        axios.get("/api/analytics")
      ]);
      setFoods(Array.isArray(foodRes.data) ? foodRes.data : demoDonations);
      setNgos(Array.isArray(ngoRes.data) ? ngoRes.data : demoNgos);
      setStatsData(typeof analyticsRes.data === "object" ? analyticsRes.data : null);
    } catch (err) {
      setFoods(demoDonations);
      setNgos(demoNgos);
    } finally {
      setLoading(false);
    }
  };

  const safeFoods = Array.isArray(foods) ? foods : [];
  const safeNgos = Array.isArray(ngos) ? ngos : [];

  const filteredFoods = safeFoods.filter((f) => {
    if (selectedStage === "all") return true;
    if (selectedStage === "Available") return f.status === "Available" || !f.status;
    if (selectedStage === "Claimed") return f.status === "Claimed";
    if (selectedStage === "Matched") return f.recommendation?.confidenceScore > 80;
    if (selectedStage === "Pickup") return f.status === "Claimed" && f.isEmergency;
    if (selectedStage === "Delivered") return f.status === "Delivered" || f.status === "Completed";
    return true;
  });

  const mealsSaved = statsData?.mealsSaved || safeFoods.filter((f) => f.status === "Claimed").reduce((sum, f) => sum + (f.quantity || 0), 0) || 0;
  const activeCount = safeFoods.filter((f) => f.status === "Available" || !f.status).length || 0;
  const orgCount = safeNgos.length || 0;
  const completionRate = statsData?.completionRate || "0%";
  const co2Saved = statsData?.co2Saved || 0;

  const metricStripData = [
    { label: "Meals rescued", value: mealsSaved.toLocaleString() },
    { label: "Active donations", value: activeCount },
    { label: "Partner organizations", value: orgCount },
    { label: "Successful deliveries", value: completionRate }
  ];

  const pipelineCounts = {
    all: safeFoods.length,
    available: activeCount,
    matched: safeFoods.filter((f) => f.recommendation?.confidenceScore > 80).length,
    claimed: safeFoods.filter((f) => f.status === "Claimed").length,
    pickup: safeFoods.filter((f) => f.status === "Claimed" && f.isEmergency).length,
    delivered: safeFoods.filter((f) => f.status === "Delivered" || f.status === "Completed").length
  };

  const timelineEvents = safeFoods.slice(0, 4).map((food, index) => ({
    time: ["10:42", "11:05", "11:18", "11:46"][index] || "--:--",
    title: index === 0 ? "Donation posted" : index === 1 ? "AI match found" : index === 2 ? "Pickup assigned" : "Delivery completed",
    desc: `${food.foodName || "Donation"}${food.quantity ? ` · ${food.quantity} servings` : ""}${food.donorName ? ` · ${food.donorName}` : ""}`
  }));

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container">
          <header className="hero-shell">
            <div className="hero-copy">
              <span className="eyebrow">LIVE RESCUE NETWORK</span>
              <h1 className="hero-title">EcoShare <span>AI</span></h1>
              <p className="hero-subtitle">AI-powered food rescue connecting surplus food with organizations, volunteers, and communities across the network.</p>
              <div className="hero-actions">
                <Link to="/add-food" className="btn-primary no-underline">
                  <Plus className="w-4 h-4" /> Create Donation
                </Link>
                <Link to="/donations" className="btn-secondary no-underline">
                  Explore Rescue Network
                </Link>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="scene-sun" />
              <div className="scene-hill scene-hill--back" />
              <div className="scene-hill scene-hill--front" />
              <div className="scene-tree tree-left" />
              <div className="scene-tree tree-mid" />
              <div className="scene-tree tree-right" />
              <div className="scene-home" />
              <div className="scene-vehicle">
                <div className="vehicle-cabin" />
                <div className="vehicle-body" />
                <div className="vehicle-wheel wheel-front" />
                <div className="vehicle-wheel wheel-back" />
              </div>
              <div className="scene-people">
                <span className="person person-a" />
                <span className="person person-b" />
                <span className="person person-c" />
              </div>
              <div className="floating-impact-card">
                <div className="mini-label">Impact today</div>
                <strong>{mealsSaved.toLocaleString()}</strong>
                <small>meals rescued</small>
              </div>
            </div>
          </header>

          <section aria-label="Key metrics" className="section-spacing">
            <MetricStrip metrics={metricStripData} />
          </section>

          <section className="dashboard-grid dashboard-grid--split section-spacing">
            <ActivityFeed events={timelineEvents} />
            <RescueStatus activeStage={selectedStage} onSelectStage={setSelectedStage} counts={pipelineCounts} />
          </section>

          <section className="dashboard-grid dashboard-grid--split section-spacing">
            <DashboardMap foods={safeFoods} ngos={safeNgos} heightClass="h-[330px]" />
            <AIRescueInsight foods={safeFoods} ngos={safeNgos} />
          </section>

          <section className="section-spacing">
            <div className="section-header section-header--split">
              <h3 className="section-title">Recent donations</h3>
              <Link to="/donations" className="text-link text-link--muted">
                View all listings
              </Link>
            </div>
            <DataTable items={filteredFoods.slice(0, 8)} />
          </section>

          <section className="impact-panel section-spacing">
            <div className="section-header section-header--split">
              <h3 className="section-title">Environmental impact</h3>
              <span className="list-pill list-pill--warning">Estimated</span>
            </div>

            <div className="impact-grid">
              <div className="impact-card">
                <span>Food waste diverted</span>
                <strong>{co2Saved > 0 ? Math.max(1, Math.round(co2Saved * 2.3)) : 0} kg</strong>
              </div>
              <div className="impact-card">
                <span>CO₂e avoided</span>
                <strong>{co2Saved} kg CO₂e</strong>
              </div>
              <div className="impact-card">
                <span>Meals provided</span>
                <strong>{mealsSaved.toLocaleString()}</strong>
              </div>
            </div>
          </section>
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default Dashboard;