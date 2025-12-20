import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import axios from "axios";
import DOMPurify from "dompurify";

/* =========================
   DESIGN THEME (PRO LEVEL)
========================= */
const theme = {
  colors: {
    primary: "#6366F1",
    secondary: "#8B5CF6",
    success: "#10B981",
    darkBg: "#0F172A",
    lightBg: "#F8FAFC",
    textDark: "#1E293B",
    textLight: "#F8FAFC",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "20px",
  },
};

/* =========================
   MAIN APP
========================= */
function App() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const suggestedQuestions = [
    "What can you help me with?",
    "How does this AI work?",
    "Tell me about your features",
    "Show me an example conversation",
  ];

  /* =========================
     RESPONSIVE CHECK
  ========================= */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /* =========================
     LOCAL STORAGE
  ========================= */
  useEffect(() => {
    const savedChat = localStorage.getItem("mn-chat-history");
    const savedTheme = localStorage.getItem("mn-theme");
    if (savedChat) setChatHistory(JSON.parse(savedChat));
    if (savedTheme) setDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("mn-chat-history", JSON.stringify(chatHistory));
    localStorage.setItem("mn-theme", darkMode ? "dark" : "light");
  }, [chatHistory, darkMode]);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, loading]);

  /* =========================
     SAFE RESPONSE FORMATTER
     (XSS PROTECTED)
  ========================= */
  const formatBotResponse = useCallback((text) => {
    if (!text) return "";

    const sanitized = DOMPurify.sanitize(text);
    return sanitized.replace(/\n/g, "<br/>");
  }, []);

  /* =========================
     SEND MESSAGE
  ========================= */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const userMessage = {
        id: Date.now(),
        sender: "user",
        text: input,
        timestamp: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const res = await axios.post(
          "https://chatbot-backend-3ryn.onrender.com/api/chat",
          { message: input }
        );

        const botText = res.data.botReply;

        const botMessage = {
          id: Date.now() + 1,
          sender: "bot",
          text: botText,
          formattedText: formatBotResponse(botText),
          timestamp: new Date().toISOString(),
        };

        setChatHistory((prev) => [...prev, botMessage]);
      } catch {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: "Something went wrong. Please try again.",
            formattedText: "Something went wrong. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
        setInput("");
        inputRef.current?.focus();
      }
    },
    [input, loading, formatBotResponse]
  );

  /* =========================
     UTILITIES
  ========================= */
  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem("mn-chat-history");
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  /* =========================
     RENDER
  ========================= */
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: darkMode
          ? `linear-gradient(135deg, ${theme.colors.darkBg}, #1E1B4B)`
          : `linear-gradient(135deg, ${theme.colors.lightBg}, #F1F5F9)`,
        fontFamily: "'Inter', system-ui",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(20px)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "1.4rem",
            fontWeight: 700,
            color: darkMode ? theme.colors.textLight : theme.colors.textDark,
          }}
        >
          MN AI Assistant
        </h1>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={clearChat}>🗑️</button>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* CHAT */}
      <div
        ref={chatContainerRef}
        style={{ flex: 1, overflowY: "auto", padding: "1rem" }}
      >
        {chatHistory.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            darkMode={darkMode}
            onCopy={copyToClipboard}
            formatTime={formatTime}
          />
        ))}

        {loading && <p style={{ opacity: 0.6 }}>AI is thinking...</p>}
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        style={{ padding: "1rem", display: "flex", gap: "0.5rem" }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          maxLength={500}
          aria-label="Chat input"
          style={{
            flex: 1,
            padding: "1rem",
            borderRadius: theme.radius.lg,
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button disabled={!input.trim() || loading}>Send</button>
      </form>
    </div>
  );
}

/* =========================
   MESSAGE COMPONENT
========================= */
const MessageBubble = memo(({ msg, darkMode, onCopy, formatTime }) => {
  const isBot = msg.sender === "bot";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginBottom: "1rem",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "1rem",
          borderRadius: "18px",
          background: isBot
            ? "#FFFFFF"
            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          color: isBot ? theme.colors.textDark : "#FFF",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: isBot ? msg.formattedText : msg.text,
          }}
        />

        <div style={{ fontSize: "0.75rem", marginTop: "0.4rem" }}>
          {formatTime(msg.timestamp)}
          {isBot && (
            <button
              onClick={() => onCopy(msg.text)}
              style={{ marginLeft: "0.5rem" }}
            >
              📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default App;

/* =========================
   ANIMATIONS
========================= */
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>`
);
