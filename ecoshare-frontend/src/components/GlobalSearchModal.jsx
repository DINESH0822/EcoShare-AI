import React, { useState, useEffect } from "react";
import axios from "axios";
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
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-400 shrink-0" />
          <input
            type="text"
            placeholder="Search donations, NGOs, claims, or operations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {loading && <div className="text-center py-6 text-slate-400">Searching platform database...</div>}

          {!loading && results && (
            <>
              {/* Donations */}
              {results.donations?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Food Rescue Donations</span>
                  {results.donations.map((d) => (
                    <div
                      key={d._id}
                      onClick={() => {
                        onClose();
                        navigate(`/donations/${d._id}`);
                      }}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-sky-500/30 cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-white">{d.foodName}</p>
                        <p className="text-[11px] text-slate-400">{d.donorName} • {d.quantity} servings</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* NGOs */}
              {results.ngos?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Verified Partner NGOs</span>
                  {results.ngos.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        onClose();
                        navigate(`/ngos/${n._id}`);
                      }}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center hover:border-emerald-500/30 cursor-pointer"
                    >
                      <div>
                        <p className="font-bold text-white">{n.ngoName}</p>
                        <p className="text-[11px] text-slate-400">{n.contactPerson} • {n.city}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !results && query.trim() && (
            <div className="text-center py-6 text-slate-500">No matching records found.</div>
          )}
        </div>

      </div>
    </div>
  );
}
