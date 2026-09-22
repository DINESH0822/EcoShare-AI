import React from "react";

export default function RescueStatus({ counts = {}, activeStage = "all", onSelectStage }) {
  const stages = [
    { key: "Available", label: "Available", count: counts.available ?? 2, color: "var(--success)" },
    { key: "Matched", label: "Matching", count: counts.matched ?? 0, color: "var(--ai)" },
    { key: "Claimed", label: "Claimed", count: counts.claimed ?? 0, color: "var(--primary)" },
    { key: "Pickup", label: "Pickup", count: counts.pickup ?? 0, color: "var(--warning)" },
    { key: "Delivered", label: "Delivered", count: counts.delivered ?? 1, color: "#10B981" },
  ];

  const total = Object.values(counts).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0) || 3;

  return (
    <div className="panel panel--soft panel--status">
      <div className="panel-header panel-header--split">
        <div>
          <p className="section-kicker">Pipeline</p>
          <h3 className="section-title">Rescue status</h3>
        </div>
        <span className="status-total">{total} total</span>
      </div>

      <div className="rescue-status-list">
        {stages.map((stage) => {
          const percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
          const isSelected = activeStage === stage.key;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onSelectStage && onSelectStage(stage.key === activeStage ? "all" : stage.key)}
              className={`status-row ${isSelected ? "is-selected" : ""}`}
            >
              <div className="status-row__meta">
                <span className="status-row__label">{stage.label}</span>
                <span className="status-row__count">{stage.count}</span>
              </div>
              <div className="status-bar">
                <span
                  className="status-bar__fill"
                  style={{ width: `${Math.max(percentage, stage.count > 0 ? 18 : 0)}%`, background: stage.color }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
