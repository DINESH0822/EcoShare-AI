import React from "react";

export default function RescuePipeline({ activeStage = "all", onSelectStage, counts = {} }) {
  const stages = [
    { key: "all", label: "All Items", count: counts.all || 0 },
    { key: "Available", label: "Available", count: counts.available || 0 },
    { key: "Matched", label: "Matched", count: counts.matched || 0 },
    { key: "Claimed", label: "Claimed", count: counts.claimed || 0 },
    { key: "Pickup", label: "Pickup En Route", count: counts.pickup || 0 },
    { key: "Delivered", label: "Delivered", count: counts.delivered || 0 }
  ];

  return (
    <div className="min-h-[120px] space-y-3 rounded-2xl border border-[var(--border)] bg-white/85 p-5 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text)]">Rescue pipeline</h3>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">Track donations through each rescue stage</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1">
        {stages.map((st, idx) => (
          <button
            key={st.key}
            onClick={() => onSelectStage && onSelectStage(st.key)}
            className={`flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
              activeStage === st.key
                ? "border border-[var(--primary-soft)] bg-[var(--primary-soft)] font-semibold text-[var(--primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            }`}
          >
            <span>{st.label}</span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-xs text-[var(--text)]">
              {st.count}
            </span>
            {idx < stages.length - 1 && <span className="ml-1.5 hidden text-[var(--text-secondary)] sm:inline">→</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
