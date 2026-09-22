import React from "react";

export default function SkeletonCard({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="h-5 bg-slate-800 rounded w-2/3" />
            <div className="h-4 bg-slate-800 rounded w-1/4" />
          </div>
          <div className="h-4 bg-slate-800/80 rounded w-full" />
          <div className="h-4 bg-slate-800/80 rounded w-4/5" />
          <div className="pt-4 border-t border-slate-800/60 flex justify-between">
            <div className="h-8 bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
