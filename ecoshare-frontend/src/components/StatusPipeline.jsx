import React from "react";
import { CheckCircle2, Package, ShieldCheck, Truck, Home } from "lucide-react";

const PIPELINE_STEPS = [
  { key: "published", label: "Published", icon: Package },
  { key: "ai_matching", label: "AI Match", icon: ShieldCheck },
  { key: "claimed", label: "Claimed", icon: CheckCircle2 },
  { key: "en_route", label: "En Route", icon: Truck },
  { key: "completed", label: "Delivered", icon: Home }
];

export default function StatusPipeline({ currentStatus = "published" }) {
  const getStepIndex = (status) => {
    const statusMap = {
      "Available": 0,
      "draft": 0,
      "published": 0,
      "ai_matching": 1,
      "match_found": 1,
      "Claimed": 2,
      "claimed": 2,
      "pickup_scheduled": 2,
      "en_route": 3,
      "arrived": 3,
      "collected": 3,
      "delivered": 4,
      "completed": 4
    };
    return statusMap[status] ?? 0;
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full bg-[#101D2D] border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-6 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 88}%` }}
        />

        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCurrent 
                    ? "bg-blue-600 text-white shadow-sm font-semibold" 
                    : isDone 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                    : "bg-[#07111F] text-slate-500 border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent ? "text-blue-400 font-semibold" : isDone ? "text-slate-300" : "text-slate-500"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
