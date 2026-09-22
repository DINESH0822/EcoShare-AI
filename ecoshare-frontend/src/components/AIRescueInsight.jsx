import React from "react";
import { Sparkles, MapPin, Clock3, ArrowRight, Building2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AIRescueInsight({ foods = [], ngos = [] }) {
  const activeFoods = foods.filter((f) => f.status === "Available" || !f.status || f.status === "published" || f.status === "ai_matching");
  const primaryFood = activeFoods[0] || foods[0];
  const matchedNgo = ngos.find((ngo) => ngo.status === "approved" || ngo.verificationStatus === "verified") || ngos[0];

  const count = activeFoods.length;
  const ngoName = matchedNgo?.ngoName || matchedNgo?.name || "No verified organization yet";
  const etaLabel = primaryFood?.recommendation?.estimatedEtaMins ? `${primaryFood.recommendation.estimatedEtaMins} mins` : "Awaiting route";
  const capacity = matchedNgo?.capacity || matchedNgo?.dailyCapacity || null;

  return (
    <div className="panel panel--soft panel--ai">
      <div className="panel-header panel-header--split">
        <div className="panel-header__title-wrap">
          <span className="icon-badge icon-badge--purple">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <div>
            <p className="section-kicker">AI matching</p>
            <h3 className="section-title">AI rescue insight</h3>
          </div>
        </div>
      </div>

      {count > 0 && primaryFood ? (
        <div className="ai-insight-content">
          <p className="ai-insight-summary">
            <span>{count}</span> active donation{count === 1 ? "" : "s"} require matching.
          </p>

          <div className="ai-insight-card">
            <div className="ai-insight-card__topline">
              <span className="list-pill list-pill--live">Nearest compatible organization</span>
            </div>
            <div className="ai-insight-card__row">
              <Building2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>{ngoName}</span>
            </div>
            <div className="ai-insight-meta-grid">
              <div className="meta-item">
                <Clock3 className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Route</span>
                <strong>{etaLabel}</strong>
              </div>
              <div className="meta-item">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Capacity</span>
                <strong>{capacity ? `${capacity} meals/day` : "Not reported"}</strong>
              </div>
            </div>
          </div>

          <div className="ai-insight-factor-list">
            <div className="factor-row"><span>Priority</span><strong>{primaryFood.priority || primaryFood.isEmergency ? "Urgent" : "Normal"}</strong></div>
            <div className="factor-row"><span>Status</span><strong>{primaryFood.status || "Available"}</strong></div>
            <div className="factor-row"><span>Quantity</span><strong>{primaryFood.quantity || 0} servings</strong></div>
          </div>
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h4>No matching opportunities</h4>
            <p>There are currently no active donation records requiring AI matching.</p>
          </div>
        </div>
      )}

      <Link to="/donations" className="secondary-action-link">
        View matching opportunities <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
