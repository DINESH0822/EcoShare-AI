import { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { Activity, Cpu, Database, Key, Mail, MessageSquare, PhoneCall, MapPin, Radio, RefreshCw } from "lucide-react";

const requestIntegrationsHealth = async () => {
  const res = await api.get("/api/health/integrations");
  const health = res.data?.data;
  if (!health || typeof health !== "object") {
    throw new Error("The health endpoint returned an invalid response.");
  }
  return health;
};

export default function Integrations() {
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    requestIntegrationsHealth()
      .then((health) => {
        if (active) setIntegrations(health);
      })
      .catch((err) => {
        if (!active) return;
        setIntegrations(null);
        setError(err.message || "Integration health could not be retrieved.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const retryIntegrationsHealth = () => {
    setLoading(true);
    setError("");
    requestIntegrationsHealth()
      .then(setIntegrations)
      .catch((err) => {
        setIntegrations(null);
        setError(err.message || "Integration health could not be retrieved.");
      })
      .finally(() => setLoading(false));
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status || "UNKNOWN";
    if (["HEALTHY", "AVAILABLE", "CONFIGURED"].includes(normalizedStatus)) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> {normalizedStatus}
        </span>
      );
    }
    const statusClass = normalizedStatus === "UNAVAILABLE"
      ? "bg-rose-50 text-rose-800 border-rose-200"
      : normalizedStatus === "DEGRADED"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-slate-50 text-slate-700 border-slate-200";
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusClass}`}>
        {normalizedStatus.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="eco-bg min-h-screen pb-20">
      <DemoModeBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
            <Activity className="w-4 h-4" /> Admin System Integration Center
          </div>
          <h1 className="text-section font-extrabold text-[var(--text)] mt-1">Provider & API Health Status</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Backend-reported status. Configuration presence does not confirm external delivery, live routing, or tile availability.
          </p>
        </div>

        {/* Integration Cards Grid */}
        {loading ? (
          <div className="text-center py-20"><div className="spinner mx-auto" /></div>
        ) : error ? (
          <div className="stat-card flex flex-col items-start gap-3">
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button type="button" onClick={retryIntegrationsHealth} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry health check
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Database */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Activity className="w-6 h-6 text-emerald-600" />
                {getStatusBadge(integrations?.backend?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Backend API</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.backend?.provider}</strong></p>
            </div>

            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Database className="w-6 h-6 text-sky-500" />
                {getStatusBadge(integrations?.database?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Database (MongoDB)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.database?.provider}</strong></p>
            </div>

            {/* Socket.io */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Radio className="w-6 h-6 text-indigo-500" />
                {getStatusBadge(integrations?.socket?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Real-time WebSockets</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.socket?.provider}</strong></p>
              <p className="text-[10px] text-[var(--text-secondary)]">{integrations?.socket?.note}</p>
            </div>

            {/* AI Engine */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Cpu className="w-6 h-6 text-emerald-500" />
                {getStatusBadge(integrations?.ai?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Explainable AI Scoring</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.ai?.provider}</strong></p>
              <p className="text-xs text-[var(--text-secondary)]">
                {integrations?.ai?.modelAvailable
                  ? `${integrations.ai.algorithm} · model ${integrations.ai.modelVersion || "version not recorded"}`
                  : "Claim predictor is unavailable; the deterministic matching rules remain separate."}
              </p>
              {integrations?.ai?.trainingScikitLearnVersion && integrations?.ai?.runtimeScikitLearnVersion &&
                integrations.ai.trainingScikitLearnVersion !== integrations.ai.runtimeScikitLearnVersion && (
                  <p className="text-[10px] font-semibold text-amber-900">
                    Artifact trained with scikit-learn {integrations.ai.trainingScikitLearnVersion}; current runtime is {integrations.ai.runtimeScikitLearnVersion}. Retrain using the deployed runtime.
                  </p>
                )}
              {integrations?.ai?.modelAvailable && !integrations?.ai?.trainingScikitLearnVersion && (
                <p className="text-[10px] font-semibold text-amber-900">
                  This artifact does not record its training scikit-learn version; retrain with the deployed runtime for reproducibility.
                </p>
              )}
              {integrations?.ai?.metrics && (
                <>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    Synthetic holdout only—not real-world performance: ROC-AUC {Number(integrations.ai.metrics.roc_auc).toFixed(3)}, accuracy {Number(integrations.ai.metrics.accuracy).toFixed(3)}, F1 {Number(integrations.ai.metrics.f1_score).toFixed(3)}.
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{integrations.ai.metricScope}</p>
                </>
              )}
              {integrations?.ai?.datasetProvenance && (
                <p className="text-[10px] text-[var(--text-secondary)]">{integrations.ai.datasetProvenance}</p>
              )}
            </div>

            {/* Maps & Geocoding */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <MapPin className="w-6 h-6 text-sky-500" />
                {getStatusBadge(integrations?.maps?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Geospatial Maps & Routing</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.routing?.provider}</strong></p>
              {integrations?.routing?.note && <p className="text-[10px] text-[var(--text-secondary)]">{integrations.routing.note}</p>}
              {integrations?.geocoding?.note && <p className="text-[10px] text-[var(--text-secondary)]">{integrations.geocoding.note}</p>}
            </div>

            {/* Email */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Mail className="w-6 h-6 text-amber-500" />
                {getStatusBadge(integrations?.email?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Email Gateway (SMTP)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.email?.provider}</strong></p>
              <p className="text-[10px] text-[var(--text-secondary)]">{integrations?.email?.note || "Requires EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD; configuration does not confirm delivery."}</p>
            </div>

            {/* WhatsApp */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <MessageSquare className="w-6 h-6 text-emerald-500" />
                {getStatusBadge(integrations?.whatsApp?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">WhatsApp Business API</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.whatsApp?.provider}</strong></p>
              <p className="text-[10px] text-[var(--text-secondary)]">{integrations?.whatsApp?.note || "Requires WhatsApp credentials; configuration does not confirm delivery."}</p>
            </div>

            {/* SMS */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <PhoneCall className="w-6 h-6 text-rose-500" />
                {getStatusBadge(integrations?.sms?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">SMS Gateway (Twilio)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.sms?.provider}</strong></p>
              <p className="text-[10px] text-[var(--text-secondary)]">{integrations?.sms?.note}</p>
            </div>

            {/* Firebase */}
            <div className="stat-card space-y-3">
              <div className="flex justify-between items-start">
                <Key className="w-6 h-6 text-amber-600" />
                {getStatusBadge(integrations?.firebase?.status)}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Firebase Phone Auth</h3>
              <p className="text-xs text-[var(--text-secondary)]">Provider: <strong>{integrations?.firebase?.provider}</strong></p>
              <p className="text-[10px] text-[var(--text-secondary)]">{integrations?.firebase?.note}</p>
            </div>
          </div>
        )}
      </main>

      <EcoBot />
    </div>
  );
}
