import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

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
    "Show me an example conversation"
  ];

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load chat history from localStorage
  useEffect(() => {
    const savedChat = localStorage.getItem("mn-chat-history");
    const savedTheme = localStorage.getItem("mn-theme");
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    }
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem("mn-chat-history", JSON.stringify(chatHistory));
    localStorage.setItem("mn-theme", darkMode ? "dark" : "light");
  }, [chatHistory, darkMode]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, loading]);

  // Function to format bot response with proper bullet points
  const formatBotResponse = (text) => {
    if (!text) return text;

    // Split by common bullet point indicators
    const lines = text.split(/\n|\r\n/);
    let formattedText = [];
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check if line starts with common bullet point patterns
      if (trimmedLine.match(/^[•\-*\d+\.]\s/) || 
          trimmedLine.match(/^\d+\)\s/) ||
          trimmedLine.startsWith("- ") ||
          trimmedLine.startsWith("* ") ||
          trimmedLine.startsWith("• ")) {
        
        if (!inList) {
          formattedText.push('<ul style="margin: 0; padding-left: 1.5rem; margin-bottom: 0.5rem;">');
          inList = true;
        }
        
        // Clean the bullet point and wrap in li
        const cleanLine = trimmedLine
          .replace(/^[•\-*\d+\.]\s/, '')
          .replace(/^\d+\)\s/, '')
          .replace(/^-\s/, '')
          .replace(/^\*\s/, '')
          .replace(/^•\s/, '');
        
        formattedText.push(`<li style="margin-bottom: 0.25rem;">${cleanLine}</li>`);
      } else {
        if (inList && trimmedLine === '') {
          formattedText.push('</ul>');
          inList = false;
        }
        
        if (trimmedLine) {
          if (inList) {
            formattedText.push('</ul>');
            inList = false;
          }
          formattedText.push(`<div style="margin-bottom: 0.5rem;">${trimmedLine}</div>`);
        }
      }
    });

    // Close any open list
    if (inList) {
      formattedText.push('</ul>');
    }

    // If no formatting was applied, return original text
    if (formattedText.length === 0) {
      return text.replace(/\n/g, '<br/>');
    }

    return formattedText.join('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { 
      sender: "user", 
      text: input,
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post("https://chatbot-backend-3ryn.onrender.com/api/chat", {
        message: input,
      });

      const botMessage = { 
        sender: "bot", 
        text: res.data.botReply,
        formattedText: formatBotResponse(res.data.botReply),
        timestamp: new Date().toISOString(),
        id: Date.now() + 1
      };
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "I apologize, but I'm experiencing connectivity issues. Please try again in a moment.",
        formattedText: "I apologize, but I'm experiencing connectivity issues. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        id: Date.now() + 1
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    localStorage.removeItem("mn-chat-history");
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const exportChat = () => {
    const chatText = chatHistory.map(msg => 
      `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get responsive styles
  const responsiveStyle = (desktop, mobile) => isMobile ? mobile : desktop;

  return (
    <div style={responsiveStyle(
      darkMode ? darkContainerStyle : lightContainerStyle,
      darkMode ? mobileDarkContainerStyle : mobileLightContainerStyle
    )}>
      {/* Header */}
      <div style={responsiveStyle(
        darkMode ? darkHeaderStyle : lightHeaderStyle,
        darkMode ? mobileDarkHeaderStyle : mobileLightHeaderStyle
      )}>
        <div style={responsiveStyle(headerContentStyle, mobileHeaderContentStyle)}>
          <div style={logoStyle}>
            <div style={darkMode ? darkLogoIconStyle : lightLogoIconStyle}>
              <span style={logoEmojiStyle}>💬</span>
            </div>
            <div style={logoTextStyle}>
              <h1 style={darkMode ? darkTitleStyle : lightTitleStyle}>
                {isMobile ? 'Ayisha AI' : 'Ayisha AI Assistant'}
              </h1>
              {!isMobile && (
                <p style={darkMode ? darkSubtitleStyle : lightSubtitleStyle}>
                  Your intelligent conversation partner
                </p>
              )}
            </div>
          </div>
          
          <div style={responsiveStyle(headerControlsStyle, mobileHeaderControlsStyle)}>
            {!isMobile && (
              <>
                <button 
                  onClick={exportChat}
                  style={darkMode ? darkSecondaryButtonStyle : lightSecondaryButtonStyle}
                  disabled={chatHistory.length === 0}
                >
                  📥 Export
                </button>
                <button 
                  onClick={clearChat}
                  style={darkMode ? darkSecondaryButtonStyle : lightSecondaryButtonStyle}
                  disabled={chatHistory.length === 0}
                >
                  🗑️ Clear
                </button>
              </>
            )}
            {isMobile && (
              <>
                <button 
                  onClick={exportChat}
                  style={darkMode ? mobileDarkIconButtonStyle : mobileLightIconButtonStyle}
                  disabled={chatHistory.length === 0}
                  title="Export chat"
                >
                  📥
                </button>
                <button 
                  onClick={clearChat}
                  style={darkMode ? mobileDarkIconButtonStyle : mobileLightIconButtonStyle}
                  disabled={chatHistory.length === 0}
                  title="Clear chat"
                >
                  🗑️
                </button>
              </>
            )}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              style={darkMode ? darkThemeButtonStyle : lightThemeButtonStyle}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatContainerRef} 
        style={responsiveStyle(chatAreaStyle, mobileChatAreaStyle)}
      >
        <div style={responsiveStyle(messagesContainerStyle, mobileMessagesContainerStyle)}>
          {/* Welcome Message */}
          {chatHistory.length === 0 && (
            <div style={responsiveStyle(welcomeContainerStyle, mobileWelcomeContainerStyle)}>
              <div style={responsiveStyle(welcomeIconStyle, mobileWelcomeIconStyle)}>🚀</div>
              <h3 style={darkMode ? darkWelcomeTitleStyle : lightWelcomeTitleStyle}>
                {isMobile ? 'Welcome!' : 'Welcome to MN AI Assistant'}
              </h3>
              <p style={darkMode ? darkWelcomeTextStyle : lightWelcomeTextStyle}>
                {isMobile 
                  ? "I'm here to help you with tasks and answer questions." 
                  : "I'm here to help you with tasks, answer questions, and provide assistance. Let's start a conversation!"
                }
              </p>
              
              {/* Suggested Questions */}
              <div style={suggestionsContainerStyle}>
                <p style={suggestionsTitleStyle}>
                  {isMobile ? 'Quick questions:' : 'Quick starters:'}
                </p>
                <div style={responsiveStyle(suggestionsGridStyle, mobileSuggestionsGridStyle)}>
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      style={darkMode ? darkSuggestionStyle : lightSuggestionStyle}
                    >
                      {isMobile ? question.split(' ').slice(0, 3).join(' ') + '...' : question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Chat History */}
          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              style={responsiveStyle(
                msg.sender === "bot" ? botMessageContainerStyle : userMessageContainerStyle,
                msg.sender === "bot" ? mobileBotMessageContainerStyle : mobileUserMessageContainerStyle
              )}
            >
              <div style={responsiveStyle(
                msg.sender === "bot" ? botMessageStyle : userMessageStyle,
                msg.sender === "bot" ? mobileBotMessageStyle : mobileUserMessageStyle
              )}>
                <div style={responsiveStyle(
                  msg.sender === "bot" ? botAvatarStyle : userAvatarStyle,
                  msg.sender === "bot" ? mobileBotAvatarStyle : mobileUserAvatarStyle
                )}>
                  {msg.sender === "bot" ? "AI" : "You"}
                </div>
                <div style={msg.sender === "bot" ? botContentStyle : userContentStyle}>
                  <div 
                    style={responsiveStyle(
                      msg.sender === "bot" ? botTextStyle : userTextStyle,
                      msg.sender === "bot" ? mobileBotTextStyle : mobileUserTextStyle
                    )}
                    dangerouslySetInnerHTML={{
                      __html: msg.sender === "bot" && msg.formattedText 
                        ? msg.formattedText 
                        : msg.text.replace(/\n/g, '<br/>')
                    }}
                  />
                  <div style={messageMetaStyle}>
                    <span style={darkMode ? darkTimeStyle : lightTimeStyle}>
                      {formatTime(msg.timestamp)}
                    </span>
                    {msg.sender === "bot" && (
                      <button 
                        onClick={() => copyToClipboard(msg.text)}
                        style={copyButtonStyle}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {loading && (
            <div style={responsiveStyle(botMessageContainerStyle, mobileBotMessageContainerStyle)}>
              <div style={responsiveStyle(botMessageStyle, mobileBotMessageStyle)}>
                <div style={responsiveStyle(botAvatarStyle, mobileBotAvatarStyle)}>AI</div>
                <div style={responsiveStyle(typingContainerStyle, mobileTypingContainerStyle)}>
                  <div style={responsiveStyle(typingIndicatorStyle, mobileTypingIndicatorStyle)}>
                    <div style={typingAnimationStyle}>
                      <span style={typingDotStyle}></span>
                      <span style={{...typingDotStyle, animationDelay: '0.2s'}}></span>
                      <span style={{...typingDotStyle, animationDelay: '0.4s'}}></span>
                    </div>
                    <div style={darkMode ? darkTypingTextStyle : lightTypingTextStyle}>
                      AI is thinking...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div style={responsiveStyle(
        darkMode ? darkInputContainerStyle : lightInputContainerStyle,
        darkMode ? mobileDarkInputContainerStyle : mobileLightInputContainerStyle
      )}>
        <form onSubmit={handleSubmit} style={responsiveStyle(formStyle, mobileFormStyle)}>
          <div style={responsiveStyle(inputWrapperStyle, mobileInputWrapperStyle)}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isMobile ? "Type a message..." : "Type your message here... (Press Enter to send)"}
              style={responsiveStyle(
                darkMode ? darkInputStyle : lightInputStyle,
                darkMode ? mobileDarkInputStyle : mobileLightInputStyle
              )}
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              maxLength={500}
            />
            <button 
              type="submit" 
              style={responsiveStyle(
                input ? sendButtonActiveStyle : sendButtonStyle,
                input ? mobileSendButtonActiveStyle : mobileSendButtonStyle
              )}
              disabled={loading || !input.trim()}
              title="Send message"
            >
              {loading ? (
                <div style={spinnerStyle}></div>
              ) : (
                <div style={sendIconStyle}>↑</div>
              )}
            </button>
          </div>
          <div style={responsiveStyle(inputFooterStyle, mobileInputFooterStyle)}>
            <div style={darkMode ? darkHintStyle : lightHintStyle}>
              {isMobile ? "💡 Ask follow-up questions" : "💡 Tip: Ask follow-up questions for more detailed responses"}
            </div>
            <div style={characterCountStyle}>
              {input.length}/500
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============================================
// DESKTOP STYLES
// =============================================

const containerStyle = {
  fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
};

const darkContainerStyle = {
  ...containerStyle,
  background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
};

const lightContainerStyle = {
  ...containerStyle,
  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
};

const headerStyle = {
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid',
  padding: '1rem 0',
  transition: 'all 0.3s ease',
  flexShrink: 0,
};

const darkHeaderStyle = {
  ...headerStyle,
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
};

const lightHeaderStyle = {
  ...headerStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderBottomColor: 'rgba(0, 0, 0, 0.1)',
};

const headerContentStyle = {
  maxWidth: '900px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 1.5rem',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
};

const logoTextStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const logoIconStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
  fontWeight: '600',
  flexShrink: 0,
};

const darkLogoIconStyle = {
  ...logoIconStyle,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: 'white',
};

const lightLogoIconStyle = {
  ...logoIconStyle,
  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
  color: 'white',
};

const logoEmojiStyle = {
  fontSize: '1.25rem',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: '700',
  lineHeight: '1.2',
  color: 'inherit',
};

const darkTitleStyle = {
  ...titleStyle,
  color: '#F8FAFC',
};

const lightTitleStyle = {
  ...titleStyle,
  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const subtitleStyle = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: '400',
};

const darkSubtitleStyle = {
  ...subtitleStyle,
  color: 'rgba(248, 250, 252, 0.8)',
};

const lightSubtitleStyle = {
  ...subtitleStyle,
  color: 'rgba(30, 41, 59, 0.8)',
};

const headerControlsStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center',
};

const buttonBaseStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  whiteSpace: 'nowrap',
};

const darkSecondaryButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#94A3B8',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const lightSecondaryButtonStyle = {
  ...buttonBaseStyle,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  color: '#64748B',
  border: '1px solid rgba(0, 0, 0, 0.1)',
};

const themeButtonStyle = {
  ...buttonBaseStyle,
  width: '40px',
  height: '40px',
  padding: 0,
  justifyContent: 'center',
};

const darkThemeButtonStyle = {
  ...themeButtonStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
};

const lightThemeButtonStyle = {
  ...themeButtonStyle,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  color: '#1E293B',
};

const chatAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '2rem 1.5rem',
  WebkitOverflowScrolling: 'touch',
};

const messagesContainerStyle = {
  maxWidth: '900px',
  margin: '0 auto',
};

const welcomeContainerStyle = {
  textAlign: 'center',
  padding: '4rem 2rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '24px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginBottom: '2rem',
};

const welcomeIconStyle = {
  fontSize: '4rem',
  marginBottom: '1.5rem',
  opacity: 0.9,
};

const welcomeTitleStyle = {
  fontSize: '2rem',
  fontWeight: '700',
  margin: '0 0 1rem 0',
  lineHeight: '1.2',
};

const darkWelcomeTitleStyle = {
  ...welcomeTitleStyle,
  color: '#F8FAFC',
};

const lightWelcomeTitleStyle = {
  ...welcomeTitleStyle,
  color: '#1E293B',
};

const welcomeTextStyle = {
  fontSize: '1.125rem',
  lineHeight: '1.6',
  margin: '0 0 2rem 0',
  maxWidth: '500px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const darkWelcomeTextStyle = {
  ...welcomeTextStyle,
  color: 'rgba(248, 250, 252, 0.8)',
};

const lightWelcomeTextStyle = {
  ...welcomeTextStyle,
  color: 'rgba(30, 41, 59, 0.8)',
};

const suggestionsContainerStyle = {
  marginTop: '2rem',
};

const suggestionsTitleStyle = {
  fontSize: '0.875rem',
  fontWeight: '600',
  margin: '0 0 1rem 0',
  opacity: 0.7,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const suggestionsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '0.75rem',
  maxWidth: '600px',
  margin: '0 auto',
};

const suggestionStyle = {
  padding: '0.75rem 1rem',
  border: '1px solid',
  borderRadius: '12px',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'left',
  background: 'transparent',
  wordBreak: 'break-word',
};

const darkSuggestionStyle = {
  ...suggestionStyle,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  color: 'rgba(248, 250, 252, 0.8)',
};

const lightSuggestionStyle = {
  ...suggestionStyle,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  color: 'rgba(30, 41, 59, 0.8)',
};

const messageContainerBase = {
  display: 'flex',
  marginBottom: '2rem',
};

const botMessageContainerStyle = {
  ...messageContainerBase,
  justifyContent: 'flex-start',
};

const userMessageContainerStyle = {
  ...messageContainerBase,
  justifyContent: 'flex-end',
};

const messageStyle = {
  display: 'flex',
  gap: '1rem',
  maxWidth: '85%',
  alignItems: 'flex-start',
};

const botMessageStyle = {
  ...messageStyle,
};

const userMessageStyle = {
  ...messageStyle,
  flexDirection: 'row-reverse',
};

const avatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  fontWeight: '600',
  flexShrink: 0,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

const botAvatarStyle = {
  ...avatarStyle,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: 'white',
};

const userAvatarStyle = {
  ...avatarStyle,
  background: 'linear-gradient(135deg, #10B981, #059669)',
  color: 'white',
};

const contentStyle = {
  flex: 1,
  minWidth: 0,
};

const botContentStyle = {
  ...contentStyle,
};

const userContentStyle = {
  ...contentStyle,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
};

const textStyle = {
  padding: '1.25rem 1.5rem',
  borderRadius: '20px',
  lineHeight: '1.6',
  fontSize: '1rem',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  wordWrap: 'break-word',
};

const botTextStyle = {
  ...textStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#1E293B',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderBottomLeftRadius: '6px',
};

const userTextStyle = {
  ...textStyle,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: 'white',
  borderBottomRightRadius: '6px',
};

const messageMetaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '0.75rem',
  fontSize: '0.8rem',
};

const timeStyle = {
  opacity: 0.7,
};

const darkTimeStyle = {
  ...timeStyle,
  color: '#94A3B8',
};

const lightTimeStyle = {
  ...timeStyle,
  color: '#64748B',
};

const copyButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  opacity: 0.6,
  transition: 'opacity 0.2s ease',
  fontSize: '0.8rem',
  padding: '4px',
};

const typingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const typingIndicatorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.25rem 1.5rem',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const typingAnimationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const typingDotStyle = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: '#6366F1',
  animation: 'typing 1.4s infinite ease-in-out',
};

const typingTextStyle = {
  fontSize: '0.9rem',
  fontWeight: '500',
};

const darkTypingTextStyle = {
  ...typingTextStyle,
  color: 'rgba(255, 255, 255, 0.7)',
};

const lightTypingTextStyle = {
  ...typingTextStyle,
  color: 'rgba(30, 41, 59, 0.7)',
};

const inputContainerStyle = {
  padding: '2rem 1.5rem',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid',
  transition: 'all 0.3s ease',
  flexShrink: 0,
};

const darkInputContainerStyle = {
  ...inputContainerStyle,
  backgroundColor: 'rgba(15, 23, 42, 0.8)',
  borderTopColor: 'rgba(255, 255, 255, 0.1)',
};

const lightInputContainerStyle = {
  ...inputContainerStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderTopColor: 'rgba(0, 0, 0, 0.1)',
};

const formStyle = {
  maxWidth: '900px',
  margin: '0 auto',
};

const inputWrapperStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-end',
  marginBottom: '0.75rem',
};

const inputStyle = {
  flex: 1,
  padding: '1.25rem 1.5rem',
  borderRadius: '20px',
  border: '1px solid',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
  resize: 'none',
  minHeight: '60px',
  fontFamily: 'inherit',
  transition: 'all 0.2s ease',
};

const darkInputStyle = {
  ...inputStyle,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  color: '#1E293B',
};

const lightInputStyle = {
  ...inputStyle,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  color: '#1E293B',
};

const sendButtonStyle = {
  padding: '1rem',
  backgroundColor: 'rgba(99, 102, 241, 0.3)',
  color: 'white',
  border: 'none',
  borderRadius: '16px',
  fontSize: '1rem',
  cursor: 'not-allowed',
  fontWeight: '600',
  width: '60px',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  opacity: 0.5,
};

const sendButtonActiveStyle = {
  ...sendButtonStyle,
  backgroundColor: 'rgba(99, 102, 241, 0.9)',
  cursor: 'pointer',
  opacity: 1,
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
};

const sendIconStyle = {
  fontSize: '1.4rem',
  fontWeight: 'bold',
};

const spinnerStyle = {
  width: '20px',
  height: '20px',
  border: '2px solid transparent',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const inputFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '0.5rem',
};

const hintStyle = {
  fontSize: '0.85rem',
  opacity: 0.7,
};

const darkHintStyle = {
  ...hintStyle,
  color: '#94A3B8',
};

const lightHintStyle = {
  ...hintStyle,
  color: '#64748B',
};

const characterCountStyle = {
  fontSize: '0.85rem',
  opacity: 0.5,
};

// =============================================
// MOBILE STYLES
// =============================================

const mobileContainerStyle = {
  ...containerStyle,
  height: '100vh',
  height: '100dvh', // Dynamic viewport height for mobile
};

const mobileDarkContainerStyle = {
  ...mobileContainerStyle,
  background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
};

const mobileLightContainerStyle = {
  ...mobileContainerStyle,
  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
};

const mobileHeaderStyle = {
  ...headerStyle,
  padding: '0.75rem 0',
  backdropFilter: 'blur(10px)',
};

const mobileDarkHeaderStyle = {
  ...mobileHeaderStyle,
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  borderBottomColor: 'rgba(255, 255, 255, 0.1)',
};

const mobileLightHeaderStyle = {
  ...mobileHeaderStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderBottomColor: 'rgba(0, 0, 0, 0.1)',
};

const mobileHeaderContentStyle = {
  ...headerContentStyle,
  padding: '0 1rem',
  maxWidth: '100%',
};

const mobileHeaderControlsStyle = {
  display: 'flex',
  gap: '0.5rem',
  alignItems: 'center',
};

const mobileIconButtonStyle = {
  padding: '0.5rem',
  border: 'none',
  borderRadius: '8px',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
};

const mobileDarkIconButtonStyle = {
  ...mobileIconButtonStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#94A3B8',
};

const mobileLightIconButtonStyle = {
  ...mobileIconButtonStyle,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  color: '#64748B',
};

const mobileChatAreaStyle = {
  ...chatAreaStyle,
  padding: '1rem',
  paddingBottom: '1.5rem',
};

const mobileMessagesContainerStyle = {
  ...messagesContainerStyle,
  maxWidth: '100%',
};

const mobileWelcomeContainerStyle = {
  ...welcomeContainerStyle,
  padding: '2.5rem 1.5rem',
  marginBottom: '1.5rem',
  borderRadius: '20px',
};

const mobileWelcomeIconStyle = {
  ...welcomeIconStyle,
  fontSize: '3rem',
  marginBottom: '1rem',
};

const mobileWelcomeTitleStyle = {
  ...welcomeTitleStyle,
  fontSize: '1.5rem',
  margin: '0 0 0.75rem 0',
};

const mobileWelcomeTextStyle = {
  ...welcomeTextStyle,
  fontSize: '1rem',
  margin: '0 0 1.5rem 0',
  lineHeight: '1.5',
};

const mobileSuggestionsGridStyle = {
  ...suggestionsGridStyle,
  gridTemplateColumns: '1fr',
  gap: '0.5rem',
  maxWidth: '100%',
};

const mobileMessageContainerBase = {
  display: 'flex',
  marginBottom: '1.5rem',
};

const mobileBotMessageContainerStyle = {
  ...mobileMessageContainerBase,
  justifyContent: 'flex-start',
};

const mobileUserMessageContainerStyle = {
  ...mobileMessageContainerBase,
  justifyContent: 'flex-end',
};

const mobileMessageStyle = {
  display: 'flex',
  gap: '0.75rem',
  maxWidth: '90%',
  alignItems: 'flex-start',
};

const mobileBotMessageStyle = {
  ...mobileMessageStyle,
};

const mobileUserMessageStyle = {
  ...mobileMessageStyle,
  flexDirection: 'row-reverse',
};

const mobileAvatarStyle = {
  ...avatarStyle,
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  fontSize: '0.7rem',
};

const mobileBotAvatarStyle = {
  ...mobileAvatarStyle,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: 'white',
};

const mobileUserAvatarStyle = {
  ...mobileAvatarStyle,
  background: 'linear-gradient(135deg, #10B981, #059669)',
  color: 'white',
};

const mobileTextStyle = {
  padding: '1rem 1.25rem',
  borderRadius: '18px',
  lineHeight: '1.5',
  fontSize: '0.95rem',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
  wordWrap: 'break-word',
};

const mobileBotTextStyle = {
  ...mobileTextStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  color: '#1E293B',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderBottomLeftRadius: '6px',
};

const mobileUserTextStyle = {
  ...mobileTextStyle,
  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  color: 'white',
  borderBottomRightRadius: '6px',
};

const mobileTypingContainerStyle = {
  ...typingContainerStyle,
  gap: '0.5rem',
};

const mobileTypingIndicatorStyle = {
  ...typingIndicatorStyle,
  padding: '1rem 1.25rem',
  gap: '0.75rem',
};

const mobileInputContainerStyle = {
  ...inputContainerStyle,
  padding: '1.5rem 1rem',
  backdropFilter: 'blur(10px)',
};

const mobileDarkInputContainerStyle = {
  ...mobileInputContainerStyle,
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  borderTopColor: 'rgba(255, 255, 255, 0.1)',
};

const mobileLightInputContainerStyle = {
  ...mobileInputContainerStyle,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderTopColor: 'rgba(0, 0, 0, 0.1)',
};

const mobileFormStyle = {
  ...formStyle,
  maxWidth: '100%',
};

const mobileInputWrapperStyle = {
  ...inputWrapperStyle,
  gap: '0.75rem',
  marginBottom: '0.5rem',
};

const mobileInputStyle = {
  ...inputStyle,
  padding: '1rem 1.25rem',
  minHeight: '56px',
  fontSize: '16px',
  borderRadius: '18px',
};

const mobileDarkInputStyle = {
  ...mobileInputStyle,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  color: '#1E293B',
};

const mobileLightInputStyle = {
  ...mobileInputStyle,
  borderColor: 'rgba(0, 0, 0, 0.1)',
  color: '#1E293B',
};

const mobileSendButtonStyle = {
  ...sendButtonStyle,
  width: '56px',
  height: '56px',
  borderRadius: '14px',
  padding: '0.875rem',
};

const mobileSendButtonActiveStyle = {
  ...mobileSendButtonStyle,
  backgroundColor: 'rgba(99, 102, 241, 0.9)',
  cursor: 'pointer',
  opacity: 1,
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
};

const mobileInputFooterStyle = {
  ...inputFooterStyle,
  flexDirection: 'column',
  gap: '0.25rem',
  alignItems: 'flex-start',
  marginTop: '0.25rem',
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
      -webkit-tap-highlight-color: transparent;
    }
    
    body {
      margin: 0;
      background: #f5f5f5;
      overflow: hidden;
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
      border-color: rgba(99, 102, 241, 0.5) !important;
      box-shadow: 0 2px 15px rgba(99, 102, 241, 0.15) !important;
    }
    
    /* Button hover effects */
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
    }
    
    button:active:not(:disabled) {
      transform: translateY(0);
    }
    
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    
    /* Suggestion hover effects */
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Copy button hover */
    button[title="Copy to clipboard"]:hover {
      opacity: 1 !important;
    }

    /* Mobile optimizations */
    @media (max-width: 768px) {
      body {
        -webkit-text-size-adjust: 100%;
      }
      
      input, textarea {
        font-size: 16px !important; /* Prevent zoom on iOS */
      }
    }
  </style>
`);

export default App;
