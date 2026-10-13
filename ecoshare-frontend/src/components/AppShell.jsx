import React from "react";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#F4F8F2] text-[#142A21] flex flex-col font-sans selection:bg-[#10B981]/20">
      <Navbar>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </Navbar>
    </div>
  );
}
