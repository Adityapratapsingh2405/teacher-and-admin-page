import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // Tracks if the widget is open
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your School AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    setInput('');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessageText,
        config: {
          systemInstruction: "You are a helpful school assistant. Keep responses clear and concise.",
        }
      });

      const aiText = response.text || "I couldn't process that request.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: aiText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: "⚠️ Connection error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.widgetWrapper}>
      {/* 1. Floating Action Button (FAB) */}
      {!isOpen && (
        <button style={styles.floatingButton} onClick={() => setIsOpen(true)}>
          💬 Ask Gemini
        </button>
      )}

      {/* 2. Floating Chat Window */}
      {isOpen && (
        <div style={styles.container}>
          <header style={styles.header}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📚 Google AI Assistant</h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Online</span>
            </div>
            {/* Close Button */}
            <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </header>

          <div style={styles.chatWindow}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f3f4',
                    color: msg.sender === 'user' ? '#ffffff' : '#333333',
                  }}
                >
                  {msg.sender === 'user' ? (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  ) : (
                    <div style={styles.markdownContent}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                  <span style={{
                    ...styles.timestamp,
                    color: msg.sender === 'user' ? '#e0e0e0' : '#888888'
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                <div style={{ ...styles.messageBubble, backgroundColor: '#f1f3f4', color: '#888888' }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              style={styles.input}
              disabled={isLoading}
            />
            <button type="submit" style={styles.button} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Layout updates for positioning in the lower right corner
const styles: { [key: string]: React.CSSProperties } = {
  widgetWrapper: {
    position: 'fixed',
    bottom: '25px',
    right: '25px',
    zIndex: 9999, // Makes sure it floats above all other page content
    fontFamily: 'Segoe UI, Roboto, sans-serif'
  },
  floatingButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '50px',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0, 123, 255, 0.4)',
    transition: 'transform 0.2s ease',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    width: '360px',
    border: '1px solid #e0e0e0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    opacity: 0.8,
  },
  chatWindow: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    backgroundColor: '#fdfdfd',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '10px 14px',
    borderRadius: '14px',
    position: 'relative',
    fontSize: '0.9rem',
  },
  markdownContent: {
    lineHeight: '1.4',
  },
  timestamp: {
    display: 'block',
    fontSize: '0.7rem',
    marginTop: '4px',
    textAlign: 'right'
  },
  inputArea: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #eee',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '0.9rem',
    outline: 'none',
  },
  button: {
    marginLeft: '8px',
    padding: '0 14px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};