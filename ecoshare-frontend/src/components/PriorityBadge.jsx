import React from "react";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

export default function PriorityBadge({ priority = "normal", isEmergency = false, score = 50 }) {
  if (isEmergency || priority === "emergency" || score >= 90) {
    return (
      <span className="badge-status badge-emergency">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
        Emergency Rescue ({score} pts)
      </span>
    );
  }

  if (priority === "high" || score >= 70) {
    return (
      <span className="badge-status bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        High Priority ({score} pts)
      </span>
    );
  }

  return (
    <span className="badge-status bg-slate-800 text-slate-300 border border-slate-700">
      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
      Standard ({score} pts)
    </span>
  );
}
