import { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import type { Section } from "../types";
import { Icon } from "./Icon";

const TOOLTIP_TIMEOUT_MS = 8000;

interface ChatProps {
  visible: boolean;
  onToggle: () => void;
  onNavigate: (section: Section) => void;
}

export function Chat({ visible, onToggle, onNavigate }: ChatProps) {
  const { messages, input, setInput, isLoading, isBlocked, send } =
    useChat(onNavigate);
  const [showTooltip, setShowTooltip] = useState(true);
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), TOOLTIP_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleToggle = () => {
    setShowTooltip(false); // never comes back once the visitor has engaged
    onToggle();
  };

  return (
    <>
      <div className="chat-fab-container">
        {showTooltip && !visible && (
          <div className="chat-tooltip" role="tooltip">
            <Icon name="smile" size={20} />
            Need help? Chat with me...
          </div>
        )}
        <button
          className="chat-fab"
          onClick={handleToggle}
          aria-label="Open AI Assistant"
        >
          <Icon name="chatBubble" size={28} strokeWidth={2.5} />
        </button>
      </div>

      {visible && (
        <div className="chat-overlay" onClick={handleToggle}>
          <div
            className="chat-widget visible"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="chat-header">
              <div className="chat-header-info">
                <div className="chat-header-avatar">
                  <Icon name="smile" size={22} />
                </div>
                <div>
                  <h3 className="chat-header-title">Lei's AI Assistant</h3>
                  <p className="chat-header-status">Online</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="chat-close-btn"
                aria-label="Close chat"
              >
                <Icon name="close" size={20} strokeWidth={2.5} round={false} />
              </button>
            </header>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.sender}`}
                >
                  {message.sender === "ai" && (
                    <div className="chat-avatar">
                      <Icon name="smile" size={22} />
                    </div>
                  )}
                  <p>{message.text}</p>
                </div>
              ))}

              {isLoading && (
                <div className="chat-message ai">
                  <div className="chat-avatar">
                    <Icon name="smile" size={22} />
                  </div>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            <footer className="chat-footer">
              {isBlocked ? (
                <div className="chat-blocked-message">
                  <Icon name="blocked" size={20} />
                  <span>Chat blocked due to off-topic questions.</span>
                </div>
              ) : (
                <form
                  className="chat-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                >
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about my projects..."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="chat-send-btn"
                    aria-label="Send message"
                    disabled={!input.trim() || isLoading}
                  >
                    <Icon name="send" size={20} strokeWidth={2.5} round={false} />
                  </button>
                </form>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
