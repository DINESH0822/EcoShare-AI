import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { useDemo } from "../config/DemoContext";
import { ShieldCheck, CheckCircle2, XCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function Admin() {
  const [ngos, setNgos] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { isDemoMode, demoNgos } = useDemo();

  useEffect(() => {
    fetchAdminData();
  }, [isDemoMode]);

  const fetchAdminData = async () => {
    setLoading(true);
    if (isDemoMode) {
      setNgos(demoNgos);
      setAuditLogs([
        { _id: "log-1", action: "DONATION_CREATED", actorName: "Grand Hyatt", entityType: "Food", createdAt: new Date().toISOString() },
        { _id: "log-2", action: "NGO_VERIFIED", actorName: "System Admin", entityType: "NGO", createdAt: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      const ngoRes = await axios.get("/api/ngo");
      setNgos(Array.isArray(ngoRes.data) ? ngoRes.data : demoNgos);

      try {
        const auditRes = await axios.get("/api/audit");
        setAuditLogs(auditRes.data.data?.logs || []);
      } catch (e) {}
    } catch (err) {
      setNgos(demoNgos);
    } finally {
      setLoading(false);
    }
  };

  const safeNgos = Array.isArray(ngos) ? ngos : [];

  const handleApproveNGO = async (id) => {
    try {
      await axios.put(`/api/ngo/${id}/approve`);
      toast.success("NGO approved and verified!");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to approve NGO");
    }
  };

  const handleRejectNGO = async (id) => {
    try {
      await axios.put(`/api/ngo/${id}/reject`);
      toast.error("NGO verification rejected");
      fetchAdminData();
    } catch (err) {
      toast.error("Failed to reject NGO");
    }
  };

  const pendingNgos = safeNgos.filter(n => n.status === "pending" || n.verificationStatus === "pending");
  const adminKpis = [
    { label: "Pending approvals", value: pendingNgos.length, accent: "text-amber-300" },
    { label: "Organizations", value: safeNgos.length, accent: "text-emerald-300" },
    { label: "Active operations", value: 12, accent: "text-sky-300" },
    { label: "Audit events", value: auditLogs.length, accent: "text-violet-300" }
  ];
  const systemHealth = [
    { label: "API", state: "Operational" },
    { label: "AI Matching", state: "Operational" },
    { label: "Notifications", state: "Degraded" },
    { label: "Database", state: "Operational" },
    { label: "Socket", state: "Offline" }
  ];

  return (
    <div className="eco-bg min-h-screen pb-16">
      <DemoModeBanner />
      <Navbar>
        <main className="page-container space-y-6">
          <div>
            <p className="section-kicker">Control center</p>
            <h1 className="text-page-title">Admin Control Center</h1>
            <p className="text-body mt-1">Platform administration, verification oversight and operational governance.</p>
          </div>

          <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold">
            {["overview", "organizations", "audit"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 capitalize cursor-pointer ${
                  activeTab === t ? "text-blue-400 border-b-2 border-blue-500" : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {adminKpis.map((item) => (
                  <div key={item.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-[20px] p-4 shadow-[0_18px_30px_rgba(2,8,20,0.2)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{item.label}</div>
                    <div className={`mt-3 text-3xl font-extrabold tracking-[-0.06em] ${item.accent}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" /> Pending Verification Queue
                    </h3>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
                      {pendingNgos.length} pending
                    </span>
                  </div>

                  {pendingNgos.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-700 bg-[#07111F]">
                      All organization registration applications are verified and up to date.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingNgos.map((ngo) => (
                        <div key={ngo._id} className="p-4 bg-[#07111F] border border-slate-800 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-base font-semibold text-white">{ngo.ngoName}</h4>
                            <p className="text-sm text-slate-400 mt-1">
                              Contact: {ngo.contactPerson} · {ngo.city || "Mumbai"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApproveNGO(ngo._id)} className="btn-primary py-2 px-3 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button onClick={() => handleRejectNGO(ngo._id)} className="btn-secondary py-2 px-3 text-xs">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-5">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-violet-400" /> System health
                  </h3>
                  <div className="space-y-3">
                    {systemHealth.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-[#07111F] px-3 py-2.5">
                        <span className="text-sm text-slate-200">{item.label}</span>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                          item.state === "Operational" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
                          item.state === "Degraded" ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
                          "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}>
                          {item.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "organizations" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-5 space-y-4">
              <h3 className="text-xl font-bold text-white">Organization Directory</h3>
              <div className="divide-y divide-slate-800 text-sm text-slate-300">
                {safeNgos.map((ngo) => (
                  <div key={ngo._id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{ngo.ngoName}</p>
                      <p className="text-slate-400 text-xs mt-1">{ngo.contactPerson} · {ngo.city}</p>
                    </div>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                      {ngo.status || "approved"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[24px] p-5 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Action Audit Trail
              </h3>
              <div className="space-y-3 text-sm">
                {auditLogs.map((log) => (
                  <div key={log._id} className="p-4 bg-[#07111F] rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-semibold text-blue-400 font-mono text-xs">{log.action}</span>
                      <span className="text-slate-300 ml-3">Actor: {log.actorName || "System"}</span>
                    </div>
                    <span className="text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </Navbar>

      <EcoBot />
    </div>
  );
}
