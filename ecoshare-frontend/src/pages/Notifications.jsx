import React from "react";
import Navbar from "../components/Navbar";
import DemoModeBanner from "../components/DemoModeBanner";
import EcoBot from "../components/EcoBot";
import { useSocket } from "../config/SocketContext";
import { Bell, Check, Trash2, Sparkles, Filter } from "lucide-react";

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();

  return (
    <div className="eco-bg min-h-screen pb-20">
      <DemoModeBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider">
              <Bell className="w-4 h-4" /> Real-time Alert Center
            </div>
            <h1 className="text-section font-extrabold text-[var(--text)] mt-1">Notifications & Dispatches</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary text-xs font-bold py-2"
            >
              <Check className="w-4 h-4 text-emerald-500" /> Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] overflow-hidden shadow-[0_18px_30px_rgba(2,8,20,0.08)]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-secondary)] font-medium">
              No notifications recorded yet. Real-time dispatches will appear here.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.read && markAsRead(n._id)}
                className={`p-5 flex items-start gap-4 transition cursor-pointer hover:bg-[var(--surface-soft)] ${
                  !n.read ? "bg-emerald-500/5" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
                  {n.type === "new_donation" ? "🍱" : n.type === "claimed" ? "🎉" : n.type === "emergency_food" ? "🚨" : "🔔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-bold ${!n.read ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>{n.title}</h4>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <EcoBot />
    </div>
  );
}
