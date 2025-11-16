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
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  return (
    <div style={containerStyle}>
      {/* Professional Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={logoStyle}>
            <div style={logoIconStyle}>💬</div>
            <h1 style={titleStyle}>MN AI Assistant</h1>
          </div>
          <button onClick={clearChat} style={clearButtonStyle}>
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} style={chatAreaStyle}>
        <div style={messagesContainerStyle}>
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <div style={welcomeContainerStyle}>
              <div style={welcomeIconStyle}>🚀</div>
              <h3 style={welcomeTitleStyle}>Welcome to MN AI Assistant</h3>
              <p style={welcomeTextStyle}>
                I'm here to help you with any questions you might have. 
                How can I assist you today?
              </p>
            </div>
          )}
          
          {/* Chat History */}
          {chatHistory.map((msg, index) => (
            <div key={index} style={msg.sender === "bot" ? botMessageContainerStyle : userMessageContainerStyle}>
              <div style={msg.sender === "bot" ? botMessageStyle : userMessageStyle}>
                <div style={msg.sender === "bot" ? botAvatarStyle : userAvatarStyle}>
                  {msg.sender === "bot" ? "AI" : "You"}
                </div>
                <div style={msg.sender === "bot" ? botTextStyle : userTextStyle}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div style={botMessageContainerStyle}>
              <div style={botMessageStyle}>
                <div style={botAvatarStyle}>AI</div>
                <div style={typingContainerStyle}>
                  <div style={typingStyle}>
                    <span style={dotStyle}></span>
                    <span style={{...dotStyle, animationDelay: '0.2s'}}></span>
                    <span style={{...dotStyle, animationDelay: '0.4s'}}></span>
                  </div>
                  <div style={typingTextStyle}>AI is thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={inputContainerStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputWrapperStyle}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              style={inputStyle}
              disabled={loading}
            />
            <button 
              type="submit" 
              style={buttonStyle} 
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <div style={spinnerStyle}></div>
              ) : (
                <div style={sendIconStyle}>↑</div>
              )}
            </button>
          </div>
          <div style={hintStyle}>
            Press Enter to send • Shift + Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Professional Styles
const containerStyle = {
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

const headerStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '1rem 0',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
};

const headerContentStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 1rem',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const logoIconStyle = {
  fontSize: '1.5rem',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  borderRadius: '12px',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.4rem',
  fontWeight: '700',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const clearButtonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: 'transparent',
  color: '#666',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'all 0.2s ease',
};

const chatAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem 1rem',
  background: 'rgba(255, 255, 255, 0.02)',
};

const messagesContainerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
};

const welcomeContainerStyle = {
  textAlign: 'center',
  padding: '3rem 1rem',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: '1rem',
};

const welcomeIconStyle = {
  fontSize: '3rem',
  marginBottom: '1rem',
};

const welcomeTitleStyle = {
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: '600',
  margin: '0 0 0.5rem 0',
};

const welcomeTextStyle = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '1rem',
  lineHeight: '1.5',
  margin: 0,
};

const botMessageContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '1.5rem',
};

const userMessageContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: '1.5rem',
};

const botMessageStyle = {
  display: 'flex',
  gap: '0.75rem',
  maxWidth: '85%',
};

const userMessageStyle = {
  display: 'flex',
  gap: '0.75rem',
  maxWidth: '85%',
  flexDirection: 'row-reverse',
};

const botAvatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: 'rgba(102, 126, 234, 0.9)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: '600',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
};

const userAvatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  backgroundColor: 'rgba(118, 75, 162, 0.9)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: '600',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
};

const botTextStyle = {
  padding: '1rem 1.25rem',
  borderRadius: '18px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  maxWidth: '100%',
  lineHeight: '1.5',
  color: '#333',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  fontSize: '0.95rem',
};

const userTextStyle = {
  padding: '1rem 1.25rem',
  borderRadius: '18px',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9))',
  color: 'white',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  maxWidth: '100%',
  lineHeight: '1.5',
  fontSize: '0.95rem',
};

const typingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const typingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '1rem 1.25rem',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '18px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const typingTextStyle = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.7)',
  marginLeft: '0.5rem',
};

const dotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#666',
  animation: 'typing 1.4s infinite ease-in-out',
};

const inputContainerStyle = {
  padding: '1.5rem 1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
};

const formStyle = {
  maxWidth: '800px',
  margin: '0 auto',
};

const inputWrapperStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-end',
};

const inputStyle = {
  flex: 1,
  padding: '1rem 1.25rem',
  borderRadius: '16px',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
  resize: 'none',
  minHeight: '52px',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
};

const buttonStyle = {
  padding: '0.875rem',
  backgroundColor: 'rgba(102, 126, 234, 0.9)',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '600',
  width: '52px',
  height: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
};

const sendIconStyle = {
  fontSize: '1.2rem',
  fontWeight: 'bold',
};

const spinnerStyle = {
  width: '16px',
  height: '16px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const hintStyle = {
  fontSize: '0.75rem',
  color: '#666',
  textAlign: 'center',
  marginTop: '0.5rem',
};

// Add CSS animations
document.head.insertAdjacentHTML('beforeend', `
  <style>
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-5px); opacity: 1; }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      background: #f5f5f5;
    }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
    
    /* Input focus effect */
    input:focus {
      border-color: rgba(102, 126, 234, 0.5) !important;
      box-shadow: 0 2px 15px rgba(102, 126, 234, 0.15) !important;
    }
    
    /* Button hover effects */
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    button:active:not(:disabled) {
      transform: translateY(0);
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }
  </style>
`);

export default App;
