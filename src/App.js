import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post("https://chatbot-backend-3ryn.onrender.com/api/chat", {
        message: input,
      });

      const botMessage = { sender: "bot", text: res.data.botReply };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Error: " + (error.response?.data?.message || error.message),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const renderMessage = (msg, index) => {
    const isBot = msg.sender === "bot";
    
    const messageStyle = {
      display: "flex",
      gap: window.innerWidth <= 768 ? "0.5rem" : "1rem",
      marginBottom: "1rem",
      ...(isBot 
        ? { paddingRight: window.innerWidth <= 768 ? "5%" : "20%" }
        : { 
            flexDirection: "row-reverse", 
            paddingLeft: window.innerWidth <= 768 ? "5%" : "20%" 
          }
      )
    };

    const avatarStyle = {
      flexShrink: 0,
      width: window.innerWidth <= 480 ? "28px" : "32px",
      height: window.innerWidth <= 480 ? "28px" : "32px",
      borderRadius: "4px",
      backgroundColor: "#ececf1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: window.innerWidth <= 480 ? "16px" : "18px",
    };

    const contentStyle = {
      padding: window.innerWidth <= 768 ? "0.6rem 0.8rem" : "0.75rem 1rem",
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      lineHeight: 1.5,
      color: "#374151",
      fontSize: window.innerWidth <= 768 ? "0.9rem" : "0.95rem",
    };

    const formattedText = msg.text
      .replace(/```([\s\S]*?)```/g, (_, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    return (
      <div key={index} style={messageStyle}>
        <div style={avatarStyle}>{isBot ? "🤖" : "👤"}</div>
        <div
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      </div>
    );
  };

  const wrapperStyle = {
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f0f2f5",
  };

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#1f2937",
    color: "#fff",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    ...(window.innerWidth <= 768 && { display: "none" })
  };

  const chatWrapperStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f9fafb",
    ...(window.innerWidth <= 768 && { width: "100%" })
  };

  const headerStyle = {
    backgroundColor: "#ffffff",
    padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    zIndex: 1,
    ...(window.innerWidth <= 768 && { textAlign: "center" })
  };

  const titleStyle = {
    margin: 0,
    color: "#202123",
    fontSize: window.innerWidth <= 480 ? "1rem" : window.innerWidth <= 768 ? "1.1rem" : "1.25rem",
    fontWeight: "600",
  };

  const formStyle = {
    display: "flex",
    gap: "0.5rem",
    padding: window.innerWidth <= 768 ? "0.75rem" : "1rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 -1px 3px rgba(0,0,0,0.1)",
    ...(window.innerWidth <= 768 && { flexDirection: "column" })
  };

  const inputStyle = {
    flex: 1,
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem",
    outline: "none",
    ...(window.innerWidth <= 768 && { 
      width: "100%", 
      marginBottom: "0.5rem" 
    })
  };

  const buttonStyle = {
    padding: window.innerWidth <= 768 ? "0.75rem" : "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: window.innerWidth <= 768 ? "0.95rem" : "1rem",
    fontWeight: "500",
    cursor: "pointer",
    ...(window.innerWidth <= 768 && { width: "100%" })
  };

  return (
    <div style={wrapperStyle}>
      {/* Sidebar - Hidden on mobile */}
      <div style={sidebarStyle}>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "1rem", textAlign: "center" }}>
          MN AI
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          <li style={{ cursor: "pointer", fontSize: "1rem", padding: "0.5rem 0.75rem", borderRadius: "8px", transition: "background-color 0.2s ease" }}>
            💬 Chats
          </li>
          <li style={{ cursor: "pointer", fontSize: "1rem", padding: "0.5rem 0.75rem", borderRadius: "8px", transition: "background-color 0.2s ease" }}>
            ⚙️ Settings
          </li>
          <li style={{ cursor: "pointer", fontSize: "1rem", padding: "0.5rem 0.75rem", borderRadius: "8px", transition: "background-color 0.2s ease" }}>
            ❓ Help
          </li>
        </ul>
      </div>

      {/* Chat Section */}
      <div style={chatWrapperStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>MN AI Chat Assistant</h2>
        </div>
        <div 
          ref={chatContainerRef} 
          style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: window.innerWidth <= 768 ? "0.75rem" : "1rem" 
          }}
        >
          <div style={{ maxWidth: "768px", margin: "0 auto" }}>
            {/* Initial bot message */}
            {chatHistory.length === 0 && (
              <div style={{
                display: "flex",
                gap: window.innerWidth <= 768 ? "0.5rem" : "1rem",
                marginBottom: "1rem",
                paddingRight: window.innerWidth <= 768 ? "5%" : "20%"
              }}>
                <div style={{
                  flexShrink: 0,
                  width: window.innerWidth <= 480 ? "28px" : "32px",
                  height: window.innerWidth <= 480 ? "28px" : "32px",
                  borderRadius: "4px",
                  backgroundColor: "#ececf1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: window.innerWidth <= 480 ? "16px" : "18px",
                }}>🤖</div>
                <div style={{
                  padding: window.innerWidth <= 768 ? "0.6rem 0.8rem" : "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  lineHeight: 1.5,
                  color: "#374151",
                  fontSize: window.innerWidth <= 768 ? "0.9rem" : "0.95rem",
                }}>
                  <strong>AI Assistant</strong><br />
                  Hello! How can I help you today?<br />
                  Feel free to ask me anything about our products, services, or policies.
                </div>
              </div>
            )}
            
            {chatHistory.map(renderMessage)}
            {loading && (
              <div style={{
                display: "flex",
                gap: window.innerWidth <= 768 ? "0.5rem" : "1rem",
                marginBottom: "1rem",
                paddingRight: window.innerWidth <= 768 ? "5%" : "20%"
              }}>
                <div style={{
                  flexShrink: 0,
                  width: window.innerWidth <= 480 ? "28px" : "32px",
                  height: window.innerWidth <= 480 ? "28px" : "32px",
                  borderRadius: "4px",
                  backgroundColor: "#ececf1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: window.innerWidth <= 480 ? "16px" : "18px",
                }}>🤖</div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#666",
                    animation: "typing 1.4s infinite ease-in-out",
                  }}></div>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#666",
                    animation: "typing 1.4s infinite ease-in-out",
                    animationDelay: "0.2s",
                  }}></div>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#666",
                    animation: "typing 1.4s infinite ease-in-out",
                    animationDelay: "0.4s",
                  }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={inputStyle}
            disabled={loading}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
