import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ecoShareKnowledge = [
  {
    keywords: ["what is ecoshare ai", "ecoshare ai", "what is this platform", "about ecoshare"],
    reply: "EcoShare AI is an AI-powered food rescue platform that connects surplus food donors with verified organizations, volunteers and logistics teams. It uses intelligent matching based on location, food type, quantity, storage capacity and urgency to reduce waste and improve delivery outcomes.",
    suggestions: ["How does AI matching work?", "How do I create a donation?", "What can I do in Donations?"],
    quickActions: [
      { label: "View Dashboard", action: "/dashboard" },
      { label: "Browse Donations", action: "/donations" }
    ]
  },
  {
    keywords: ["ai matching", "how does ai", "match donation", "explain ai matching", "matching workflow"],
    reply: "The AI matching workflow evaluates each donation against participating organizations using distance, food category, quantity, storage capacity, rescue urgency and current operational availability. It then scores and ranks the most suitable organizations and recommends the best rescue option.",
    suggestions: ["How do I track a rescue?", "What is EcoShare AI?", "How are organizations verified?"],
    quickActions: [{ label: "View Analytics", action: "/analytics" }]
  },
  {
    keywords: ["create a donation", "how do i create", "post food", "add donation", "new donation"],
    reply: "Open the Donations view and choose Create Donation. Add the food type, quantity, pickup location, expiry details, and storage condition. Once published, EcoShare AI evaluates urgency and recommends the best organization for pickup and redistribution.",
    suggestions: ["What can I do in Donations?", "How does AI matching work?"],
    quickActions: [{ label: "+ Add Food", action: "/add-food" }]
  },
  {
    keywords: ["donation", "donations", "create donation", "what can i do in donations"],
    reply: "The Donations section lets you create and manage surplus food listings, view their live status, monitor AI matches, and follow the rescue journey from donation creation to pickup and delivery.",
    suggestions: ["How do I track a rescue?", "How does AI matching work?"],
    quickActions: [{ label: "Browse Donations", action: "/donations" }]
  },
  {
    keywords: ["track rescue", "how do i track a rescue", "pickup", "delivery tracking", "where is my rescue"],
    reply: "Open Operations to view the live rescue pipeline. Each mission shows the donation, assigned organization, volunteer, ETA, pickup progress and delivery status so the rescue flow remains transparent and easy to track.",
    suggestions: ["What can I do in Operations?", "How does AI matching work?"],
    quickActions: [{ label: "Open Operations", action: "/operations" }]
  },
  {
    keywords: ["organization", "ngo", "org", "verified organization", "how are organizations verified"],
    reply: "Organizations are verified through the EcoShare approval workflow, which checks capacity, eligibility, food safety readiness and operational reliability. Only verified organizations can receive food and participate in matching.",
    suggestions: ["What can I do in Organizations?", "How does AI matching work?"],
    quickActions: [{ label: "View Network", action: "/organizations" }]
  },
  {
    keywords: ["analytics", "impact", "environmental impact", "how is environmental impact calculated"],
    reply: "EcoShare measures impact by estimating meals rescued, food waste diverted, carbon offset and water saved based on the rescued volume and the distribution workflow. Impact numbers are clearly labeled as estimated when they are calculated approximations.",
    suggestions: ["What is EcoShare AI?", "How does AI matching work?"],
    quickActions: [{ label: "View Analytics", action: "/analytics" }]
  },
  {
    keywords: ["food safety", "safety", "safe food"],
    reply: "EcoShare emphasizes safe handling and operational readiness. Donations include storage and condition details, and organizations are expected to meet safety and compliance requirements before accepting food transfers.",
    suggestions: ["How are organizations verified?", "How does AI matching work?"],
    quickActions: [{ label: "Open Dashboard", action: "/dashboard" }]
  },
  {
    keywords: ["admin", "admin functions", "platform administration", "approve organization", "audit"],
    reply: "Admins manage verification queues, approve or reject organizations, monitor system activity and review audit logs. The Admin Control Center helps maintain governance, performance visibility and platform reliability.",
    suggestions: ["How are organizations verified?", "What is EcoShare AI?"],
    quickActions: [{ label: "Open Admin", action: "/admin" }]
  },
  {
    keywords: ["rescue operations", "operations", "active rescue", "current missions"],
    reply: "Operations is the live rescue command center. It displays active missions, assigned volunteers, NGO partners, route status, ETA and delivery progress so the field team can monitor the full workflow.",
    suggestions: ["How do I track a rescue?", "What can I do in Donations?"],
    quickActions: [{ label: "Open Operations", action: "/operations" }]
  },
  {
    keywords: ["history", "audit history", "past activity", "log"],
    reply: "History captures a traceable record of donations, AI matches, pickups, delivery completions and system activity. It helps maintain accountability and lets you review the full rescue timeline.",
    suggestions: ["What can I do in Operations?", "What is EcoShare AI?"],
    quickActions: [{ label: "Open History", action: "/history" }]
  },
  {
    keywords: ["navigation", "how do i use this app", "where do i go", "platform navigation"],
    reply: "Use the left sidebar as the main navigation. Dashboard gives the platform overview, Donations manages food listings, Organizations tracks verified partners, Operations monitors rescues, Analytics shows impact and History keeps the operational trace.",
    suggestions: ["What can I do in Donations?", "What is EcoShare AI?"],
    quickActions: [
      { label: "Dashboard", action: "/dashboard" },
      { label: "Organizations", action: "/organizations" }
    ]
  }
];

const getFallbackReply = (message) => {
  const text = message.toLowerCase();
  const user = JSON.parse(localStorage.getItem("userInfo") || "null");

  const match = ecoShareKnowledge.find((entry) =>
    entry.keywords.some((keyword) => text.includes(keyword))
  );

  if (match) {
    return match;
  }

  return {
    reply: `Hello${user?.name ? ", " + user.name.split(" ")[0] : ""}. I'm EcoBot, the EcoShare rescue assistant. I can help with donations, NGO matching, rescue operations, analytics, verification and overall platform navigation.`,
    suggestions: [
      "What is EcoShare AI?",
      "How does AI matching work?",
      "How do I create a donation?",
      "How do I track a rescue?",
      "How are organizations verified?",
      "How is environmental impact calculated?"
    ],
    quickActions: [
      { label: "Open Dashboard", action: "/dashboard" },
      { label: "Browse Organizations", action: "/organizations" }
    ]
  };
};

export default function EcoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello. I'm EcoBot, the EcoShare rescue assistant. I can help you understand donations, organizations, AI matching, rescue operations, and the platform workflow."
    }
  ]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const suggestedPrompts = [
    "What is EcoShare AI?",
    "How does AI matching work?",
    "How do I create a donation?",
    "How are organizations verified?",
    "How do I track a rescue?",
    "How is environmental impact calculated?"
  ];

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!userText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      if (!res.ok) {
        throw new Error(`Chatbot backend returned ${res.status}`);
      }

      const data = await res.json();

      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.data.reply,
            suggestions: data.data.suggestions || [],
            quickActions: data.data.quickActions || []
          }
        ]);
      } else {
        const fallback = getFallbackReply(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: fallback.reply,
            suggestions: fallback.suggestions || [],
            quickActions: fallback.quickActions || []
          }
        ]);
      }
    } catch (err) {
      const fallback = getFallbackReply(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: fallback.reply,
          suggestions: fallback.suggestions || [],
          quickActions: fallback.quickActions || []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="ecobot-launcher"
          title="EcoBot AI Assistant"
          aria-label="EcoBot AI Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="ecobot-panel">
          <div className="ecobot-header">
            <div className="ecobot-header__identity">
              <div className="ecobot-header__icon">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3>EcoBot AI</h3>
                <p>
                  <span className="online-dot" /> Food Rescue Copilot
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="icon-button" aria-label="Close chatbot">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="ecobot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender === "user" ? "message-row--user" : "message-row--bot"}`}>
                <div className={`message-bubble ${msg.sender === "user" ? "message-bubble--user" : "message-bubble--bot"}`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="quick-actions">
                      {msg.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setIsOpen(false);
                            navigate(qa.action);
                          }}
                          className="quick-action"
                        >
                          {qa.label} <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="suggestion-row">
                    {msg.suggestions.map((suggestion, idx) => (
                      <button key={idx} onClick={() => handleSend(suggestion)} className="suggestion-pill">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="thinking-pill">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ecobot-input-row">
            <div className="suggestion-list">
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => handleSend(prompt)} className="suggestion-chip">
                  {prompt}
                </button>
              ))}
            </div>
            <div className="composer">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask EcoBot anything..."
              />
              <button onClick={() => handleSend()} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
