import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Search, X, Package, Shield, FileText, Truck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch (err) {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.35)] backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_22px_44px_rgba(11,66,47,0.12)] animate-fade-in">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <input
            type="text"
            placeholder="Search donations, NGOs, claims, or operations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text)] rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {loading && <div className="text-center py-6 text-[var(--text-secondary)]">Searching platform database...</div>}

          {!loading && results && (
            <>
              {/* Donations */}
              {results.donations?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider block">Food Rescue Donations</span>
                  {results.donations.map((d) => (
                    <div
                      key={d._id}
                      onClick={() => {
                        onClose();
                        navigate(`/donations/${d._id}`);
                      }}
                      className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl flex justify-between items-center hover:border-[var(--primary)]/30 cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-[var(--text)]">{d.foodName}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{d.donorName} • {d.quantity} servings</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                  ))}
                </div>
              )}

              {/* NGOs */}
              {results.ngos?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Verified Partner NGOs</span>
                  {results.ngos.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        onClose();
                        navigate(`/ngos/${n._id}`);
                      }}
                      className="p-3 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl flex justify-between items-center hover:border-emerald-500/30 cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-[var(--text)]">{n.ngoName}</p>
                        <p className="text-[11px] text-[var(--text-secondary)]">{n.contactPerson} • {n.city}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !results && query.trim() && (
            <div className="text-center py-6 text-[var(--text-secondary)]">No matching records found.</div>
          )}
        </div>

      </div>
    </div>
  );
}
