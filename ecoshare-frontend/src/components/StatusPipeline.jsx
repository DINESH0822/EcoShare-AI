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
    <div className="w-full rounded-xl border border-[var(--border)] bg-white/80 p-4 shadow-[var(--shadow)] backdrop-blur-sm">
      <div className="relative flex min-w-0 items-start justify-between">
        <div className="absolute left-6 right-6 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[var(--border)]" />
        <div
          className="absolute left-6 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${(activeIndex / (PIPELINE_STEPS.length - 1)) * 88}%` }}
        />

        {PIPELINE_STEPS.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex min-w-0 flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all sm:h-9 sm:w-9 ${
                  isCurrent
                    ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                    : isDone
                    ? "border border-[var(--primary-soft)] bg-[var(--primary-soft)] text-[var(--primary)]"
                    : "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-secondary)]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`mt-2 max-w-full text-center text-[10px] leading-tight font-medium sm:text-xs ${isCurrent ? "font-semibold text-[var(--primary)]" : isDone ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
