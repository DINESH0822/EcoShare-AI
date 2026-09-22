import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { Link } from "react-router-dom";
import { useDemo } from "../config/DemoContext";
import { Search, MapPin, ShieldCheck, ArrowRight, Plus, Building2 } from "lucide-react";

function NGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { isDemoMode, demoNgos } = useDemo();

  const fetchNGOs = async () => {
    setLoading(true);
    if (isDemoMode) {
      setNgos(demoNgos);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("/api/ngo");
      setNgos(Array.isArray(res.data) ? res.data : demoNgos);
    } catch (err) {
      setNgos(demoNgos);
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
    if (statusFilter !== "All") {
      const status = ngo.status || ngo.verificationStatus || "approved";
      if (statusFilter.toLowerCase() !== status.toLowerCase()) return false;
    }
    return true;
  });

  const networkStats = [
    { label: "Verified organizations", value: safeNgos.length, hint: "Across the network" },
    { label: "Total capacity", value: `${safeNgos.reduce((sum, ngo) => sum + (Number(ngo.capacity) || 0), 0).toLocaleString()} meals/day`, hint: "Available for rescue" },
    { label: "Active rescue zones", value: "12", hint: "Operationally mapped" }
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
              <p className="text-body mt-1">Discover verified and participating organizations across the rescue network.</p>
            </div>
            <Link to="/organizations/register" className="btn-primary no-underline self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Register Organization
            </Link>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {networkStats.map((stat) => (
              <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{stat.label}</div>
                <div className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[var(--text)]">{stat.value}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{stat.hint}</div>
              </div>
            ))}
          </section>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_10px_18px_rgba(17,52,40,0.02)]">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search organization, city, or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="eco-input pl-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 bg-[var(--surface-soft)] border border-[var(--border)] p-1 rounded-lg">
              {["All", "Approved", "Pending"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer min-h-[38px] ${
                    statusFilter === s
                      ? "bg-[var(--primary-soft)] text-[var(--primary-dark)] shadow-sm font-semibold"
                      : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 text-center text-sm text-[var(--text-secondary)]">Loading organizations...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-8 text-center text-sm text-[var(--text-secondary)]">No organizations found.</div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
              {filtered.map((ngo) => (
                <div key={ngo._id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 min-h-[270px] shadow-[0_18px_30px_rgba(2,8,20,0.2)] hover:-translate-y-1 transition-all duration-200">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-dark)] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text)] text-lg leading-tight">{ngo.ngoName}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Verified partner</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(22,131,75,0.08)] text-[var(--primary-dark)] px-2.5 py-1 text-[10px] font-bold uppercase">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--primary)]" /> {ngo.address || ngo.city}</div>
                    <div className="flex items-center justify-between"><span>Capacity</span><strong className="text-[var(--text)] text-base">{ngo.capacity || 250} meals/day</strong></div>
                    <div className="flex items-center justify-between"><span>Storage</span><strong className="text-[var(--text)]">{ngo.refrigerationAvailable ? "Refrigerated" : "Standard"}</strong></div>
                    <div className="flex items-center justify-between"><span>Contact</span><strong className="text-[var(--text)]">{ngo.contactPerson}</strong></div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-secondary)]">{ngo.phone || "Verified"}</span>
                    <Link to={`/ngos/${ngo._id}`} className="inline-flex items-center gap-1 text-[var(--primary-dark)] font-semibold no-underline">
                      View profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}

export default NGOs;