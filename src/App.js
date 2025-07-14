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
    const className = isBot ? styles.botMessage : styles.userMessage;

    const formattedText = msg.text
      .replace(/```([\s\S]*?)```/g, (_, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    return (
      <div key={index} style={className}>
        <div style={styles.avatar}>
          {isBot ? "🤖" : "👤"}
        </div>
        <div 
          style={styles.messageContent}
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI Assistant</h2>
      </div>
      <div ref={chatContainerRef} style={styles.chatContainer}>
        <div style={styles.chatContent}>
          {chatHistory.map(renderMessage)}
          {loading && (
            <div style={styles.botMessage}>
              <div style={styles.avatar}>🤖</div>
              <div style={styles.typingIndicator}>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
          disabled={loading}
        />
        <button 
          type="submit" 
          style={styles.button} 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  title: {
    margin: 0,
    color: '#202123',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    '@media (max-width: 768px)': {
      padding: '0.5rem',
    },
  },
  chatContent: {
    maxWidth: '768px',
    margin: '0 auto',
  },
  botMessage: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    paddingRight: '20%',
  },
  userMessage: {
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '1rem',
    marginBottom: '1rem',
    paddingLeft: '20%',
  },
  avatar: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    backgroundColor: '#ececf1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  messageContent: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    lineHeight: 1.5,
    color: '#374151',
    '& pre': {
      backgroundColor: '#f8f8f8',
      padding: '1rem',
      borderRadius: '4px',
      overflowX: 'auto',
      fontFamily: 'monospace',
      fontSize: '0.9em',
      margin: '0.5rem 0',
    },
    '& code': {
      fontFamily: 'monospace',
    },
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '0.75rem 1rem',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#666',
    animation: 'typing 1.4s infinite ease-in-out',
    '@keyframes typing': {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-4px)' },
    },
    ':nth-child(2)': { animationDelay: '0.2s' },
    ':nth-child(3)': { animationDelay: '0.4s' },
  },
  form: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      padding: '0.5rem',
    },
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    '&:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59,130,246,0.2)',
    },
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#2563eb',
    },
    '&:disabled': {
      opacity: '0.7',
      cursor: 'not-allowed',
    },
  },
};

export default App;