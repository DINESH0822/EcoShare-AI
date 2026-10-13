import React from "react";
import { Sparkles, Play, ShieldAlert } from "lucide-react";
import { useDemo } from "../config/DemoContext";

export default function DemoModeBanner() {
  const { isDemoMode, toggleDemoMode } = useDemo();

  return (
    <div className="demo-banner">
      <div className="demo-banner__left">
        <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="demo-banner__title">EcoShare AI Platform</span>
        <span className="demo-banner__subtitle">
          {isDemoMode ? "Showing realistic sample data across dashboards" : "Preview the platform with realistic sample data"}
        </span>
      </div>

      <div className="demo-banner__actions">
        {isDemoMode && (
          <span className="demo-banner__pill">
            <ShieldAlert className="w-3 h-3" /> DEMO DATA ACTIVE
          </span>
        )}
        <button
          onClick={toggleDemoMode}
          className={`demo-banner__toggle ${isDemoMode ? "is-active" : ""}`}
        >
          <Play className="w-3 h-3" />
          {isDemoMode ? "Exit Demo Mode" : "Quick Demo Mode"}
        </button>
      </div>
    </div>
  );
}
