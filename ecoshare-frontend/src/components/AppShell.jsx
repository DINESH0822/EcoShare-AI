import React from "react";
import Navbar from "./Navbar";

/**
 * Shared AppShell Component
 * Ensures every authenticated and operational page has the same layout structure,
 * zero strange padding/negative margin jumps, and perfectly consistent dark navy styling.
 */
export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#06111F] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#10B981]/30">
      <Navbar>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </Navbar>
    </div>
  );
}
