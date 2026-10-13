import React from "react";
import { Inbox, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmptyState({ 
  title = "No items found", 
  description = "There are currently no records available in this section.", 
  actionLabel, 
  actionRoute 
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]">
        <Inbox className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[var(--text)]">{title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">{description}</p>
      </div>
      {actionLabel && actionRoute && (
        <button
          onClick={() => navigate(actionRoute)}
          className="btn-primary mt-2 text-xs"
        >
          <Plus className="w-4 h-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}
