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

  return (
    <div style={containerStyle}>
      {/* Simple Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>MN AI Chat Assistant</h2>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} style={chatAreaStyle}>
        <div style={messagesContainerStyle}>
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <div style={botMessageStyle}>
              <div style={avatarStyle}>🤖</div>
              <div style={messageStyle}>
                <strong>Hello!</strong> How can I help you today?
              </div>
            </div>
          )}
          
          {/* Chat History */}
          {chatHistory.map((msg, index) => (
            <div key={index} style={msg.sender === "bot" ? botMessageStyle : userMessageStyle}>
              <div style={avatarStyle}>{msg.sender === "bot" ? "🤖" : "👤"}</div>
              <div style={messageStyle}>{msg.text}</div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div style={botMessageStyle}>
              <div style={avatarStyle}>🤖</div>
              <div style={typingStyle}>
                <span style={dotStyle}></span>
                <span style={{...dotStyle, animationDelay: '0.2s'}}></span>
                <span style={{...dotStyle, animationDelay: '0.4s'}}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={inputStyle}
          disabled={loading}
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

// Styles
const containerStyle = {
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f5f5'
};

const headerStyle = {
  backgroundColor: '#3b82f6',
  color: 'white',
  padding: '1rem',
  textAlign: 'center'
};

const titleStyle = {
  margin: 0,
  fontSize: '1.2rem'
};

const chatAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '1rem'
};

const messagesContainerStyle = {
  maxWidth: '100%',
  margin: '0 auto'
};

const botMessageStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const userMessageStyle = {
  display: 'flex',
  flexDirection: 'row-reverse',
  gap: '0.5rem',
  marginBottom: '1rem'
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  flexShrink: 0
};

const messageStyle = {
  padding: '0.75rem',
  borderRadius: '12px',
  backgroundColor: 'white',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  maxWidth: '70%',
  lineHeight: '1.4'
};

const typingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '0.75rem',
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
};

const dotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#666',
  animation: 'typing 1.4s infinite ease-in-out'
};

const formStyle = {
  display: 'flex',
  gap: '0.5rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderTop: '1px solid #e0e0e0'
};

const inputStyle = {
  flex: 1,
  padding: '0.75rem',
  borderRadius: '20px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none'
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  fontSize: '1rem',
  cursor: 'pointer'
};

// Add CSS animation
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }
  </style>
`);

export default App;
