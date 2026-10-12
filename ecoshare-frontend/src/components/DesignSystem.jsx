import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  action,
  badge,
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#20364D]/60">
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[#9CAFC3] mb-1.5">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {b.to ? (
                  <Link to={b.to} className="hover:text-[#10B981] transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-[#F1F5F9] font-medium">{b.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-[#9CAFC3] mt-1 max-w-3xl">{description}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "green",
}) {
  const colorMap = {
    green: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20",
    blue: "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20",
    purple: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
    amber: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
    red: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
  };

  const selectedColor = colorMap[color] || colorMap.green;

  return (
    <div className="bg-[#0D1E31] border border-[#20364D] rounded-xl p-5 hover:border-[#20364D]/80 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#9CAFC3]">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${selectedColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F9] tracking-tight">
          {value}
        </span>
      </div>
      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-[#9CAFC3] flex items-center gap-2">
          {trend && <span className="font-medium text-[#10B981]">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase().replace(/_/g, " ");

  let style = "bg-slate-800 text-slate-300 border-slate-700";

  if (["available", "published", "completed", "verified", "active"].includes(normalized)) {
    style = "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30";
  } else if (["claimed", "pickup scheduled", "matching", "en route"].includes(normalized)) {
    style = "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30";
  } else if (["urgent", "emergency", "pending", "claim requested"].includes(normalized)) {
    style = "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30";
  } else if (["expired", "cancelled", "rejected", "failed"].includes(normalized)) {
    style = "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${style}`}
    >
      {normalized}
    </span>
  );
}

export function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-[#0D1E31]/80 rounded-xl border border-[#20364D]/50" />
      ))}
    </div>
  );
}
