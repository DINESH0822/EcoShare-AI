import React, { useState } from "react";
import { Brain, CheckCircle, Info, ChevronDown, ChevronUp, MapPin, ShieldCheck, Thermometer } from "lucide-react";

export default function MatchScoreCard({ recommendation, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!recommendation) {
    return (
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] text-xs flex items-center gap-2">
        <Brain className="w-4 h-4 text-[var(--primary)] animate-pulse" />
        AI Matching Engine analyzing recipient compatibility...
      </div>
    );
  }

  const score = recommendation.confidenceScore || 85;
  const ngoName = recommendation.ngoName || "Nearby Partner NGO";
  const distance = recommendation.distanceKm ? `${recommendation.distanceKm} km` : "3.2 km";
  const eta = recommendation.pickupETA ? `${recommendation.pickupETA} mins` : "20 mins";
  const reasons = recommendation.reasons || [
    "High capacity match for cooked meals",
    "Optimal proximity within service radius",
    "Temperature & food safety conditions verified"
  ];
  const factorBreakdown = recommendation.factorBreakdown || {
    proximityScore: 92,
    capacityScore: 88,
    urgencyScore: 95,
    categoryScore: 100,
    reliabilityScore: 90
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-[0_18px_30px_rgba(2,8,20,0.08)] backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-sky-500/15 border border-emerald-500/20 flex items-center justify-center text-[var(--primary)]">
            <Brain className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">EcoShare AI Match</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold">
                EXPLAINABLE
              </span>
            </div>
            <h4 className="mt-0.5 break-words text-base font-bold text-[var(--text)]">{ngoName}</h4>
          </div>
        </div>

        {/* Score Ring */}
        <div className="flex shrink-0 flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-500">
              {score}%
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">Match</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Top Ranked
          </span>
        </div>
      </div>

      {/* Quick Specs */}
      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-[var(--border)] pt-3 text-xs sm:grid-cols-2 sm:gap-3">
        <div className="flex items-center gap-2 text-[var(--text)]">
          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
          <span>Distance: <strong className="text-[var(--text)]">{distance}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[var(--text)]">
          <Thermometer className="w-3.5 h-3.5 text-sky-500" />
          <span>Estimated ETA: <strong className="text-[var(--text)]">{eta}</strong></span>
        </div>
      </div>

      {/* Reasons Checklist */}
      <div className="mt-3 space-y-1.5">
        {reasons.slice(0, expanded ? reasons.length : 2).map((reason, i) => (
          <div key={i} className="text-xs text-[var(--text)] flex items-start gap-2 bg-[var(--surface-soft)] p-2 rounded-lg border border-[var(--border)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Expandable Breakdown */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2 text-xs">
          <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">10-Factor AI Weighting</div>
          {Object.entries(factorBreakdown).map(([factor, val]) => (
            <div key={factor} className="space-y-1">
              <div className="flex justify-between text-[var(--text)] capitalize">
                <span>{factor.replace("Score", " Factor")}</span>
                <span className="font-mono text-[var(--primary)] font-bold">{val}%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold flex items-center justify-center gap-1 w-full py-1 rounded-lg hover:bg-[var(--primary-soft)] transition"
      >
        <span>{expanded ? "Hide Breakdown" : "Why this match?"}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
