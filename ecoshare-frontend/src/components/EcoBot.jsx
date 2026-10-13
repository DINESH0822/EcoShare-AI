import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, ExternalLink, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const createInitialMessages = () => [{
  sender: "bot",
  text: "Hello. I’m EcoBot. I can look up records available to your account and explain EcoShare workflows.",
  suggestions: ["What donations do I have?", "Show my pending claims", "How does AI matching work?"],
  timestamp: new Date().toISOString()
}];

const readAuthIdentity = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userInfo") || "null");
    return user?.token ? `${user._id || ""}:${user.token}` : "";
  } catch (error) {
    console.warn("Could not read EcoBot account context:", error.message);
    return "";
  }
};

const formatTimestamp = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function EcoBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(createInitialMessages);

  const messagesEndRef = useRef(null);
  const pendingRequestRef = useRef(false);
  const authIdentityRef = useRef(readAuthIdentity());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const resetForAccountChange = () => {
      const nextIdentity = readAuthIdentity();
      if (nextIdentity === authIdentityRef.current) return;
      authIdentityRef.current = nextIdentity;
      setMessages(createInitialMessages());
      setInput("");
      setIsOpen(false);
    };

    resetForAccountChange();
    window.addEventListener("storage", resetForAccountChange);
    return () => window.removeEventListener("storage", resetForAccountChange);
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (userText = input, { retry = false } = {}) => {
    const textToSend = userText.trim();
    if (!textToSend || pendingRequestRef.current) return;

    const nextIdentity = readAuthIdentity();
    const accountChanged = nextIdentity !== authIdentityRef.current;
    if (accountChanged) {
      authIdentityRef.current = nextIdentity;
      setMessages(createInitialMessages());
      setInput("");
      if (retry) return;
    }
    pendingRequestRef.current = true;
    if (!retry) {
      setMessages((prev) => [...(accountChanged ? createInitialMessages() : prev), { sender: "user", text: textToSend, timestamp: new Date().toISOString() }]);
      setInput("");
    }
    setLoading(true);

    try {
      const previousIntent = accountChanged ? undefined : [...messages].reverse().find((message) => message.sender === "bot" && message.intent)?.intent;
      const res = await api.post("/api/chatbot/query", {
        message: textToSend,
        context: { previousIntent }
      });
      const result = res.data?.data ?? res.data;
      if (!result?.reply) throw new Error("The assistant returned an empty response.");
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: result.reply,
        intent: result.intent,
        suggestions: result.suggestions || [],
        quickActions: result.quickActions || [],
        timestamp: result.timestamp || new Date().toISOString()
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        sender: "bot",
        text: `Live data could not be retrieved. ${err.message || "Check your connection and try again."}`,
        retryText: textToSend,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      pendingRequestRef.current = false;
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
        <section className="ecobot-panel" role="dialog" aria-label="EcoBot assistant" aria-modal="false">
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
              <div key={`${msg.timestamp}-${i}`} className={`message-row ${msg.sender === "user" ? "message-row--user" : "message-row--bot"}`}>
                <div className={`message-bubble ${msg.sender === "user" ? "message-bubble--user" : "message-bubble--bot"}`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {msg.timestamp && <time className="ecobot-message-time">{formatTimestamp(msg.timestamp)}</time>}

                  {msg.retryText && (
                    <button type="button" onClick={() => handleSend(msg.retryText, { retry: true })} disabled={loading} className="ecobot-retry">
                      Retry request
                    </button>
                  )}

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
                      <button key={idx} type="button" disabled={loading} onClick={() => handleSend(suggestion)} className="suggestion-pill">
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
            <div className="composer">
              <textarea
                rows={2}
                aria-label="Ask EcoBot a question"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask EcoBot anything..."
              />
              <button type="button" onClick={() => handleSend()} disabled={loading || !input.trim()} aria-label="Send message">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
