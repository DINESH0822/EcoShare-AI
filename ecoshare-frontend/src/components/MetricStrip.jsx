import React from "react";
import { Utensils, HeartHandshake, Building2, CheckCircle2 } from "lucide-react";

export default function MetricStrip({ metrics = [] }) {
  const defaultIcons = [Utensils, HeartHandshake, Building2, CheckCircle2];

  return (
    <div className="metric-grid">
      {metrics.map((m, idx) => {
        const IconComponent = defaultIcons[idx % defaultIcons.length];
        return (
          <div key={m.label} className="metric-card">
            <div className="metric-card__icon">
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="metric-card__value">{m.value}</div>
            <div className="metric-card__label">{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}
