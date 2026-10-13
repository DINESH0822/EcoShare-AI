import { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { Link } from "react-router-dom";
import { useDemo } from "../config/DemoContext";
import { Search, MapPin, ShieldCheck, Clock, XCircle, ArrowRight, Plus, Building2, Phone, Snowflake, CheckCircle2 } from "lucide-react";

function NGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [errorMsg, setErrorMsg] = useState("");
  const { isDemoMode, demoNgos } = useDemo();

  const fetchNGOs = async () => {
    setLoading(true);
    setErrorMsg("");
    if (isDemoMode) {
      setNgos(demoNgos || []);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/api/ngo");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      // Deduplicate by _id
      const uniqueNgos = [];
      const seenIds = new Set();
      for (const item of data) {
        const id = item._id ? String(item._id) : (item.id || item.ngoName);
        if (!seenIds.has(id)) {
          seenIds.add(id);
          uniqueNgos.push(item);
        }
      }
      setNgos(uniqueNgos);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to load organizations from the database.");
      setNgos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNGOs();
  }, [isDemoMode]);

  const safeNgos = Array.isArray(ngos) ? ngos : [];

  const filtered = safeNgos.filter((ngo) => {
    const query = search.toLowerCase();
    const matchesSearch =
      ngo.ngoName?.toLowerCase().includes(query) ||
      ngo.address?.toLowerCase().includes(query) ||
      ngo.contactPerson?.toLowerCase().includes(query) ||
      ngo.city?.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const rawStatus = (ngo.verificationStatus || ngo.status || "pending").toLowerCase();
    const isVerified = rawStatus === "verified" || rawStatus === "approved";
    const isPending = rawStatus === "pending" || rawStatus === "pending_review" || rawStatus === "under_review";
    const isRejected = rawStatus === "rejected";

    if (statusFilter === "Verified" && !isVerified) return false;
    if (statusFilter === "Pending" && !isPending) return false;
    if (statusFilter === "Rejected" && !isRejected) return false;

    return true;
  });

  const verifiedCount = safeNgos.filter(n => {
    const s = (n.verificationStatus || n.status || "").toLowerCase();
    return s === "verified" || s === "approved";
  }).length;

  const totalCapacity = safeNgos.reduce((sum, ngo) => sum + (Number(ngo.capacity || ngo.dailyCapacity) || 0), 0);

  const networkStats = [
    { label: "Total Organizations", value: safeNgos.length, hint: "Registered rescue partners" },
    { label: "Verified & Active", value: verifiedCount, hint: "Approved for claim operations" },
    { label: "Rescue Capacity", value: `${totalCapacity.toLocaleString()} meals/day`, hint: "Aggregate daily distribution" }
  ];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="section-kicker">Rescue network</p>
              <h1 className="text-page-title">Organizations & NGO Network</h1>
              <p className="text-body mt-1">Discover verified non-profit partners, shelters, and community kitchens across the platform.</p>
            </div>
            <Link to="/organizations/register" className="btn-primary no-underline self-start sm:self-auto flex items-center gap-2">
              <Plus className="w-4 h-4" /> Register as NGO
            </Link>
          </div>

          {/* Network KPIs */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {networkStats.map((stat) => (
              <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{stat.label}</div>
                <div className="mt-2.5 text-3xl font-extrabold tracking-[-0.04em] text-[var(--text)]">{stat.value}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{stat.hint}</div>
              </div>
            ))}
          </section>

          {/* Search and Filters */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_10px_18px_rgba(17,52,40,0.02)]">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search by name, city, location, or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="eco-input pl-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[var(--surface-soft)] border border-[var(--border)] p-1 rounded-xl">
              {["All", "Verified", "Pending", "Rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === s
                      ? "bg-[var(--primary)] text-slate-950 shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm flex items-center justify-between">
              <span>{errorMsg}</span>
              <button onClick={fetchNGOs} className="underline font-bold text-xs cursor-pointer">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-12 text-center text-sm text-[var(--text-secondary)] flex flex-col items-center gap-3">
              <div className="spinner w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <span>Loading verified organization directory...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-12 text-center text-sm text-[var(--text-secondary)]">
              <Building2 className="w-10 h-10 mx-auto text-[var(--text-secondary)] mb-3" />
              <p className="font-semibold text-[var(--text)]">No organizations match the selected criteria.</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Try refining your search keyword or clearing the status filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((ngo) => {
                const rawStatus = (ngo.verificationStatus || ngo.status || "pending").toLowerCase();
                const isVerified = rawStatus === "verified" || rawStatus === "approved";
                const isPending = rawStatus === "pending" || rawStatus === "pending_review" || rawStatus === "under_review";
                const isRejected = rawStatus === "rejected";

                return (
                  <div key={ngo._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 shadow-[0_18px_30px_rgba(2,8,20,0.2)] flex flex-col justify-between hover:border-[var(--primary-soft)] transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[var(--text)] text-base leading-snug line-clamp-1">{ngo.ngoName}</h3>
                            <p className="text-xs text-[var(--text-secondary)] capitalize mt-0.5">
                              {ngo.organizationType ? ngo.organizationType.replace(/_/g, " ") : "Non-Profit Organization"}
                            </p>
                          </div>
                        </div>

                        {isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5 text-xs text-[var(--text-secondary)] py-2 border-y border-[var(--border)]">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="line-clamp-1">{ngo.address || ngo.city || "Location not recorded"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-secondary)]">Daily Capacity:</span>
                          <strong className="text-[var(--text)] font-semibold">{ngo.dailyCapacity ?? ngo.capacity ?? "Not recorded"} meals/day</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-secondary)]">Cold Storage:</span>
                          <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
                            {(ngo.hasRefrigeration ?? ngo.refrigerationAvailable) === true ? (
                              <><Snowflake className="w-3 h-3 text-sky-500" /> Refrigerated</>
                            ) : (ngo.hasRefrigeration ?? ngo.refrigerationAvailable) === false ? (
                              "Not available"
                            ) : (
                              "Not recorded"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-secondary)]">Contact:</span>
                          <span className="text-[var(--text)] font-medium">{ngo.contactPerson || "Not recorded"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {ngo.phone || "Not recorded"}
                      </span>
                      <Link to={`/ngos/${ngo._id}`} className="inline-flex items-center gap-1 text-[var(--primary)] font-bold hover:text-[var(--primary-dark)] no-underline">
                        Profile & Operations <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default NGOs;