import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { useDemo } from "../config/DemoContext";
import { Search, Clock3, ArrowRight } from "lucide-react";

function History() {
  const [searchParams] = useSearchParams();
  const traceQuery = searchParams.get("trace") || "";
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(traceQuery);
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchHistory();
  }, [isDemoMode]);

  const fetchHistory = async () => {
    setLoading(true);
    if (isDemoMode) {
      setHistoryLogs([
        { _id: "h-1", action: "created", details: "Donation 'Excess Catering Cooked Rice & Paneer' (120 servings) published.", performedByName: "Grand Hyatt", createdAt: new Date().toISOString() },
        { _id: "h-2", action: "ai_recommended", details: "AI matched with 'Robin Hood Army' (98% confidence score).", performedByName: "EcoShare AI Engine", createdAt: new Date().toISOString() },
        { _id: "h-3", action: "claimed", details: "Donation claimed by NGO 'Robin Hood Army'. Operation #op-101 initiated.", performedByName: "Robin Hood Army", createdAt: new Date().toISOString() },
        { _id: "h-4", action: "pickup", details: "Volunteer Rajesh started pickup from Bandra East location.", performedByName: "Rajesh", createdAt: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/history");
      const data = res.data;
      setHistoryLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const safeLogs = Array.isArray(historyLogs) ? historyLogs : [];

  const [typeFilter, setTypeFilter] = useState("all");

  const filteredLogs = safeLogs.filter((log) => {
    const query = search.toLowerCase();
    const matchesText =
      log.details?.toLowerCase().includes(query) ||
      log.action?.toLowerCase().includes(query) ||
      log.performedByName?.toLowerCase().includes(query);

    if (!matchesText) return false;
    if (typeFilter === "all") return true;
    const normalizedAction = log.action?.toLowerCase() || "";
    if (typeFilter === "donations") return normalizedAction.includes("created") || normalizedAction.includes("claimed");
    if (typeFilter === "ai") return normalizedAction.includes("ai");
    if (typeFilter === "pickups") return normalizedAction.includes("pickup") || normalizedAction.includes("pickup_scheduled");
    if (typeFilter === "deliveries") return normalizedAction.includes("delivery") || normalizedAction.includes("delivered");
    if (typeFilter === "system") return normalizedAction.includes("system") || normalizedAction.includes("audit");
    return true;
  });

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container page-container--tight">
          <header className="page-header page-header--stack">
            <div>
              <p className="section-kicker">Rescue history</p>
              <h1 className="text-page-title">Rescue History</h1>
              <p className="text-body">Track donations, claims, pickups, and deliveries across the full rescue lifecycle.</p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="history-search">
                <Search className="w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search action, actor, or detail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'donations', 'ai', 'pickups', 'deliveries', 'system'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTypeFilter(option)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                      typeFilter === option ? 'bg-[var(--primary-soft)] text-[var(--primary-dark)] border border-[rgba(0,208,132,0.2)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="history-summary">
            <div className="history-summary__card">
              <span>Records</span>
              <strong>{safeLogs.length}</strong>
            </div>
            <div className="history-summary__card">
              <span>Live actions</span>
              <strong>{safeLogs.filter((log) => log.action !== "created").length}</strong>
            </div>
            <div className="history-summary__card">
              <span>Last update</span>
              <strong>{safeLogs.length ? "Today" : "—"}</strong>
            </div>
          </section>

          <section className="history-list">
            {loading ? (
              <div className="empty-state">
                <div>
                  <h4>Loading audit trail</h4>
                  <p>Collecting rescue events and provenance updates.</p>
                </div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="empty-state">
                <div>
                  <h4>No rescue events found</h4>
                  <p>Try a different query or search term.</p>
                </div>
              </div>
            ) : (
              filteredLogs.map((log, idx) => (
                <article key={log._id || idx} className="history-card">
                  <div className="history-card__time">
                    <Clock3 className="w-4 h-4" />
                    {new Date(log.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </div>

                  <div className="history-card__topline">
                    <span className="history-tag">{log.action}</span>
                    <span className="history-card__actor">{log.performedByName || "System"}</span>
                  </div>

                  <p className="history-card__detail">{log.details}</p>

                  <button type="button" className="history-card__action">
                    View timeline <ArrowRight className="w-4 h-4" />
                  </button>
                </article>
              ))
            )}
          </section>
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default History;