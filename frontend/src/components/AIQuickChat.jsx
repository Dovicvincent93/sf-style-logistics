import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AIQuickChat.css";

export default function AIQuickChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("dovic_ai_chat");
    return saved
      ? JSON.parse(saved)
      : [
          {
            role: "assistant",
            content:
              "Hi 👋 I’m **Dovic AI Assistant 🤖**. I can help with tracking, delivery status, quotes, and logistics questions.",
          },
        ];
  });

  /* ================= SAVE CHAT HISTORY ================= */
  useEffect(() => {
    localStorage.setItem("dovic_ai_chat", JSON.stringify(messages));
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await api.post("/ai/chat", {
        messages: [...messages, userMessage],
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I’m having trouble responding right now. Please try again shortly.",
        },
      ]);
    }
  };

  return (
    <>
      {/* ================= CHAT WINDOW ================= */}
      <div className={`ai-chat ${open ? "open" : ""}`}>
        <div className="ai-header">
          <span>🤖 Dovic AI Assistant</span>
          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="ai-body">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              {m.content}
            </div>
          ))}
        </div>

        <div className="ai-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tracking, delivery, quotes..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      {/* ================= FLOATING AI BUTTON ================= */}
      <button
        className="ai-fab"
        title="Chat with Dovic AI"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>
    </>
  );
}
