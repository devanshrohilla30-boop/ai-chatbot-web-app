
import { useState } from "react";
import {
  Bot,
  Menu,
  Plus,
  Send,
  User,
  Sparkles,
  LoaderCircle,
  Trash2
} from "lucide-react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage = { role: "user", content: text };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.reply
        }
      ]);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput("");
    setError("");
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Bot size={25} />
            <span>AI Assistant</span>
          </div>

          <button
            className="icon-button"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu size={21} />
          </button>
        </div>

        <button className="new-chat" onClick={newChat}>
          <Plus size={19} />
          <span>New Chat</span>
        </button>

        <div className="history">
          <p className="history-title">YOUR ASSISTANT</p>

          <div className="history-item">
            <Sparkles size={17} />
            <span>Start a new conversation</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="profile">
            <div className="avatar">D</div>
            <div>
              <strong>Devansh</strong>
              <small>Free Account</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          {!sidebarOpen && (
            <button
              className="icon-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
          )}

          <h3>AI Chatbot</h3>

          <span className="status">
            <span className="status-dot"></span>
            {loading ? "Thinking..." : "Online"}
          </span>
        </header>

        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-icon">
                <Bot size={38} />
              </div>

              <h1>How can I help you today?</h1>

              <p>
                Ask me anything. I'm here to help you learn, create and explore.
              </p>

              <div className="suggestions">
                <button
                  onClick={() => setInput("Explain Artificial Intelligence")}
                >
                  <Sparkles size={18} />
                  <span>
                    <strong>Learn something</strong>
                    <small>Explain Artificial Intelligence</small>
                  </span>
                </button>

                <button
                  onClick={() =>
                    setInput("Help me write a program in JavaScript")
                  }
                >
                  <Bot size={18} />
                  <span>
                    <strong>Write some code</strong>
                    <small>Help me with programming</small>
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div className={`message ${message.role}`} key={index}>
                  <div className="message-avatar">
                    {message.role === "user" ? (
                      <User size={19} />
                    ) : (
                      <Bot size={19} />
                    )}
                  </div>

                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">
                    <Bot size={19} />
                  </div>

                  <div className="message-content loading-message">
                    <LoaderCircle size={18} />
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="input-area">
          <div className="input-box">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message your AI assistant..."
              rows="1"
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </div>

          <p className="disclaimer">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
