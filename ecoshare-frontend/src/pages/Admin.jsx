import React, { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { useDemo } from "../config/DemoContext";
import { ShieldCheck, CheckCircle2, XCircle, FileText, AlertTriangle, Building2, Users, Utensils, RefreshCw, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function Admin() {
  const [ngos, setNgos] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionInProgress, setActionInProgress] = useState(null);
  const { isDemoMode, demoNgos } = useDemo();

  useEffect(() => {
    fetchAdminData();
  }, [isDemoMode]);

  const fetchAdminData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setNgos(demoNgos || []);
      setAuditLogs([
        { _id: "log-1", action: "DONATION_CREATED", actorName: "Grand Hyatt", entityType: "Food", createdAt: new Date().toISOString() },
        { _id: "log-2", action: "NGO_VERIFIED", actorName: "System Admin", entityType: "NGO", createdAt: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      const ngoRes = await api.get("/api/ngo");
      const data = Array.isArray(ngoRes.data) ? ngoRes.data : (ngoRes.data?.data || []);
      setNgos(data);

      try {
        const auditRes = await api.get("/api/audit");
        setAuditLogs(auditRes.data.data?.logs || []);
      } catch (e) {
        setAuditLogs([]);
      }
    } catch (err) {
      toast.error("Failed to load admin management data");
      setNgos([]);
    } finally {
      setLoading(false);
    }
  };

  const safeNgos = Array.isArray(ngos) ? ngos : [];

  const handleApproveNGO = async (id, name) => {
    if (!window.confirm(`Are you sure you want to approve and verify '${name}' for full platform operations?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await api.put(`/api/ngo/${id}/approve`);
      toast.success(`Organization '${name}' successfully approved and verified!`);
      await fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve NGO");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectNGO = async (id, name) => {
    if (!window.confirm(`Are you sure you want to reject the application for '${name}'?`)) {
      return;
    }

    setActionInProgress(id);
    try {
      await api.put(`/api/ngo/${id}/reject`);
      toast.error(`Organization '${name}' verification rejected.`);
      await fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject NGO");
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingNgos = safeNgos.filter(n => {
    const s = (n.verificationStatus || n.status || "").toLowerCase();
    return s === "pending" || s === "pending_review" || s === "under_review";
  });

  const verifiedNgos = safeNgos.filter(n => {
    const s = (n.verificationStatus || n.status || "").toLowerCase();
    return s === "verified" || s === "approved";
  });

  const adminKpis = [
    { label: "Pending Approvals", value: pendingNgos.length, accent: "text-amber-400" },
    { label: "Verified Partners", value: verifiedNgos.length, accent: "text-emerald-400" },
    { label: "Total Organizations", value: safeNgos.length, accent: "text-sky-400" },
    { label: "Audited Events", value: auditLogs.length, accent: "text-indigo-400" }
  ];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="section-kicker">Administrative governance</p>
              <h1 className="text-page-title">Admin Management Portal</h1>
              <p className="text-body mt-1">Platform administration, NGO compliance verification, and action audit trail.</p>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="btn-secondary self-start sm:self-auto text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 border-b border-[var(--border)] text-xs font-semibold">
            {[
              { id: "overview", label: "Overview & Queue" },
              { id: "organizations", label: "All Organizations" },
              { id: "audit", label: "Security & Audit Trail" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`cursor-pointer capitalize pb-3 transition-colors ${
                  activeTab === t.id
                    ? "border-b-2 border-[var(--primary)] font-bold text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {adminKpis.map((item) => (
                  <div key={item.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-5 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{item.label}</div>
                    <div className={`mt-2.5 text-3xl font-extrabold tracking-[-0.04em] ${item.accent}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
                {/* Pending NGO queue */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
                  <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[var(--border)]">
                    <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" /> Pending Verification Queue
                    </h3>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                      {pendingNgos.length} Awaiting Audit
                    </span>
                  </div>

                  {pendingNgos.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[var(--text-secondary)] rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)]">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-semibold text-[var(--text)]">No pending NGO registration audits.</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">All registered rescue partners have been evaluated.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {pendingNgos.map((ngo) => (
                        <div key={ngo._id} className="p-4 bg-[var(--surface-soft)] border border-[var(--border)] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[var(--text)]">{ngo.ngoName}</h4>
                              <span className="text-[10px] bg-[var(--surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded capitalize border border-[var(--border)]">
                                {ngo.organizationType || "ngo"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                              Contact: <strong className="text-[var(--text)]">{ngo.contactPerson}</strong> · {ngo.phone} · {ngo.city || "Mumbai"}
                            </p>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                              Capacity: {ngo.capacity || ngo.dailyCapacity || 100} meals/day · Email: {ngo.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveNGO(ngo._id, ngo.ngoName)}
                              disabled={actionInProgress === ngo._id}
                              className="btn-primary py-2 px-3 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectNGO(ngo._id, ngo.ngoName)}
                              disabled={actionInProgress === ngo._id}
                              className="btn-secondary py-2 px-3 text-xs flex items-center gap-1 cursor-pointer border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* System Governance & Compliance rules */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 shadow-[0_18px_30px_rgba(2,8,20,0.2)] space-y-4">
                  <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border)]">
                    <AlertTriangle className="w-4 h-4 text-sky-500" /> Verification Criteria
                  </h3>
                  <div className="space-y-3 text-xs text-[var(--text-secondary)]">
                    <div className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
                      <p className="font-semibold text-emerald-700 mb-0.5">1. Cold Storage Check</p>
                      <p className="text-[var(--text-secondary)]">Validate if organization handles perishable items requiring refrigeration under 5°C.</p>
                    </div>
                    <div className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
                      <p className="font-semibold text-emerald-700 mb-0.5">2. Capacity Alignment</p>
                      <p className="text-[var(--text-secondary)]">Ensure stated daily meal distribution matches verified recipient facility limits.</p>
                    </div>
                    <div className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
                      <p className="font-semibold text-emerald-700 mb-0.5">3. FSSAI & Legal Status</p>
                      <p className="text-[var(--text-secondary)]">Authorized representatives must confirm non-profit declaration and adherence to safety guidelines.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Organizations */}
          {activeTab === "organizations" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 space-y-4 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="text-base font-bold text-[var(--text)]">Full Platform Organization Registry</h3>
                <span className="text-xs text-[var(--text-secondary)]">{safeNgos.length} total registered entities</span>
              </div>

              <div className="divide-y divide-[var(--border)] text-xs text-[var(--text-secondary)]">
                {safeNgos.map((ngo) => {
                  const rawStatus = (ngo.verificationStatus || ngo.status || "pending").toLowerCase();
                  const isVerified = rawStatus === "verified" || rawStatus === "approved";
                  const isRejected = rawStatus === "rejected";

                  return (
                    <div key={ngo._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[var(--text)] text-sm">{ngo.ngoName}</p>
                          <span className="text-[10px] text-[var(--text-secondary)] font-mono">#{String(ngo._id).slice(-6)}</span>
                        </div>
                        <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                          {ngo.contactPerson} · {ngo.phone} · {ngo.email} · {ngo.city || "Mumbai"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isVerified ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                          isRejected ? "bg-rose-500/10 text-rose-300 border border-rose-500/30" :
                          "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        }`}>
                          {isVerified ? "Verified" : isRejected ? "Rejected" : "Pending Review"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Action Audit Trail */}
          {activeTab === "audit" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-6 space-y-4 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
                  <FileText className="h-5 w-5 text-[var(--primary)]" /> Platform Security & Action Audit Trail
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">{auditLogs.length} logged events</span>
              </div>

              {auditLogs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-8 text-center text-sm text-[var(--text-secondary)]">
                  No audit events recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="flex flex-col justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <span className="rounded border border-[var(--primary-soft)] bg-[var(--primary-soft)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--primary)]">
                          {log.action}
                        </span>
                        <span className="text-[var(--text)]">
                          Actor: <strong className="text-[var(--text)]">{log.actorName || "System Admin"}</strong> ({log.actorRole || "Admin"})
                        </span>
                      </div>
                      <span className="flex items-center gap-1 whitespace-nowrap font-mono text-[11px] text-[var(--text-secondary)]">
                        <Clock className="h-3 w-3 text-[var(--text-secondary)]" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
