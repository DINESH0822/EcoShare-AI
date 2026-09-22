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
    <div className="bg-[#0D1A2A] border border-[rgba(148,163,184,0.14)] rounded-2xl p-5 space-y-3 min-h-[120px]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#F8FAFC]">Rescue pipeline</h3>
          <p className="text-sm text-[#94A3B8] mt-0.5">Track donations through each rescue stage</p>
        </div>
      </div>

      <div className="flex items-center justify-between overflow-x-auto gap-2 pt-1">
        {stages.map((st, idx) => (
          <button
            key={st.key}
            onClick={() => onSelectStage && onSelectStage(st.key)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeStage === st.key
                ? "bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 font-semibold"
                : "text-[#94A3B8] hover:bg-[#111F31] hover:text-[#F8FAFC]"
            }`}
          >
            <span>{st.label}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#07111F] text-xs text-[#F8FAFC] font-mono border border-[rgba(148,163,184,0.14)]">
              {st.count}
            </span>
            {idx < stages.length - 1 && <span className="text-[#1E3045] ml-1.5 hidden sm:inline">→</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
