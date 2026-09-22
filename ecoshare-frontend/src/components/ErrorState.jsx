import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message = "Unable to load data.", onRetry }) {
  return (
    <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-rose-200">{title}</h3>
        <p className="text-xs text-rose-300/80 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      )}
    </div>
  );
}
