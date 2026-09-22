import React, { useState } from "react";
import { Brain, CheckCircle, Info, ChevronDown, ChevronUp, MapPin, ShieldCheck, Thermometer } from "lucide-react";

export default function MatchScoreCard({ recommendation, compact = false }) {
  const [expanded, setExpanded] = useState(false);

  if (!recommendation) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
        <Brain className="w-4 h-4 text-sky-400 animate-pulse" />
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
    <div className="bg-slate-900/80 border border-sky-500/20 rounded-2xl p-5 shadow-lg shadow-sky-950/20 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">EcoShare AI Match</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-semibold">
                EXPLAINABLE
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-100 mt-0.5">{ngoName}</h4>
          </div>
        </div>

        {/* Score Ring */}
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              {score}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Match</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Top Ranked
          </span>
        </div>
      </div>

      {/* Quick Specs */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-sky-400" />
          <span>Distance: <strong className="text-white">{distance}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
          <span>Estimated ETA: <strong className="text-white">{eta}</strong></span>
        </div>
      </div>

      {/* Reasons Checklist */}
      <div className="mt-3 space-y-1.5">
        {reasons.slice(0, expanded ? reasons.length : 2).map((reason, i) => (
          <div key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Expandable Breakdown */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">10-Factor AI Weighting</div>
          {Object.entries(factorBreakdown).map(([factor, val]) => (
            <div key={factor} className="space-y-1">
              <div className="flex justify-between text-slate-300 capitalize">
                <span>{factor.replace("Score", " Factor")}</span>
                <span className="font-mono text-sky-400 font-bold">{val}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full" 
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center justify-center gap-1 w-full py-1 rounded-lg hover:bg-sky-500/10 transition"
      >
        <span>{expanded ? "Hide Breakdown" : "Why this match?"}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
