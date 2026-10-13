import React from "react";
import { AlertTriangle, Clock, ShieldCheck } from "lucide-react";

export default function PriorityBadge({ priority = "normal", isEmergency = false, score = 50 }) {
  if (isEmergency || priority === "emergency" || score >= 90) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
        Emergency Rescue ({score} pts)
      </span>
    );
  }

  if (priority === "high" || score >= 70) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        High Priority ({score} pts)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
      <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
      Standard ({score} pts)
    </span>
  );
}
