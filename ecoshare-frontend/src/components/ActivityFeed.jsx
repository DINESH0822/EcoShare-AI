import React from "react";
import { Clock3, ArrowRight } from "lucide-react";

export default function ActivityFeed({ events = [] }) {
  const defaultEvents = [
    {
      time: "10:42",
      title: "Donation posted",
      desc: "Excess Catering Cooked Rice & Paneer Curry · 120 servings · Grand Hyatt Banquet Services",
      action: "View donation"
    },
    {
      time: "11:05",
      title: "AI match found",
      desc: "Matched with Robin Hood Army – BKC · Distance 2.8 km · Match Confidence 92%",
      action: "View match"
    },
    {
      time: "11:18",
      title: "Pickup scheduled",
      desc: "Volunteer assigned and dispatch ETA confirmed for the next rescue window.",
      action: "Track"
    },
    {
      time: "11:46",
      title: "Delivery completed",
      desc: "Rescue closed successfully and impact logged to the network dashboard.",
      action: "View report"
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="panel panel--soft panel--timeline">
      <div className="panel-header panel-header--split">
        <div>
          <p className="section-kicker">Operations</p>
          <h3 className="section-title">Rescue activity</h3>
        </div>
        <span className="live-pill">
          <Clock3 className="w-3.5 h-3.5" /> Live
        </span>
      </div>

      <div className="timeline" aria-label="Rescue activity timeline">
        {displayEvents.map((item, idx) => (
          <div key={idx} className="activity-row">
            <div className="activity-time">{item.time}</div>
            <div className="activity-dot" aria-hidden="true" />
            <div className="activity-content">
              <div className="activity-title">{item.title}</div>
              <div className="activity-copy">{item.desc}</div>
            </div>
            <button type="button" className="activity-action">
              {item.action || "View"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
