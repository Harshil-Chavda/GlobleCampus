"use client";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  Send,
  Bot,
  Mic,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm the GlobalCampus AI. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("English");
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, language }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "bot", text: data.text }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I encountered an error. Please try again. (Make sure API Key is set)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Map language selection to BCP 47 tags
      const langMap = {
        English: "en-US",
        Hindi: "hi-IN",
        Chinese: "zh-CN",
        Gujarati: "gu-IN",
      };
      recognition.lang = langMap[language] || "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognition.start();
    } else {
      alert(
        "Voice input is not supported in this browser. Please use Chrome or Edge.",
      );
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      {/* Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            color: "white",
            border: "none",
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          <Bot size={32} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              width: isFullScreen ? "100vw" : "400px",
              height: isFullScreen ? "100vh" : "600px",
              borderRadius: isFullScreen ? "0" : "20px",
              bottom: isFullScreen ? "0" : "2rem",
              right: isFullScreen ? "0" : "2rem",
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: "fixed",
              background: "#1e293b",
              border: isFullScreen ? "none" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              zIndex: 10000,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "linear-gradient(90deg, #6366f1, #a855f7)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "white",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    padding: "6px",
                    borderRadius: "50%",
                  }}
                >
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                    GlobalCampus AI
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{
                        background: "rgba(0,0,0,0.2)",
                        border: "none",
                        color: "white",
                        fontSize: "0.75rem",
                        borderRadius: "4px",
                        padding: "2px 4px",
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Gujarati">Gujarati</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={toggleFullScreen}
                  title={isFullScreen ? "Minimize" : "Full Screen"}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "0.2s",
                  }}
                >
                  {isFullScreen ? (
                    <Minimize2 size={18} />
                  ) : (
                    <Maximize2 size={18} />
                  )}
                </button>
                <button
                  onClick={toggleChat}
                  title="Close"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "0.2s",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: "1.5rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "#0f172a",
                position: "relative",
              }}
            >
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "1rem",
                    borderRadius:
                      msg.role === "user"
                        ? "16px 16px 0 16px"
                        : "16px 16px 16px 0",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "#1e293b",
                    color: "white",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    border:
                      msg.role === "bot"
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "none",
                    position: "relative",
                  }}
                >
                  {msg.role === "bot" ? (
                    <div style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p style={{ marginBottom: "0.8rem" }} {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              style={{
                                marginLeft: "1.2rem",
                                marginBottom: "0.8rem",
                              }}
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              style={{
                                marginLeft: "1.2rem",
                                marginBottom: "0.8rem",
                              }}
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: "0.3rem" }} {...props} />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              style={{
                                color: "#60a5fa",
                                textDecoration: "underline",
                              }}
                              {...props}
                            />
                          ),
                          code: ({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) => {
                            return inline ? (
                              <code
                                style={{
                                  background: "rgba(0,0,0,0.3)",
                                  padding: "2px 4px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                }}
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <pre
                                style={{
                                  background: "rgba(0,0,0,0.3)",
                                  padding: "1rem",
                                  borderRadius: "8px",
                                  overflowX: "auto",
                                  marginBottom: "0.8rem",
                                }}
                                {...props}
                              >
                                <code style={{ fontFamily: "monospace" }}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      <button
                        onClick={() => copyToClipboard(msg.text, index)}
                        style={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          background: "rgba(255,255,255,0.1)",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px",
                          color: copiedIndex === index ? "#4ade80" : "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Copy Response"
                      >
                        {copiedIndex === index ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                      {msg.text}
                    </div>
                  )}
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    alignSelf: "flex-start",
                    padding: "0.8rem 1.2rem",
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                  }}
                >
                  Thinking...
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "1.2rem",
                background: "#0f172a",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.8rem",
                  background: "#1e293b",
                  padding: "0.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Ask in ${language}...`}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    padding: "0.5rem 0.8rem",
                    color: "white",
                    outline: "none",
                    fontSize: "0.95rem",
                  }}
                />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startListening}
                  style={{
                    background: isListening
                      ? "#ef4444"
                      : "rgba(255,255,255,0.1)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  title="Voice Input"
                >
                  <Mic
                    size={18}
                    className={isListening ? "animate-pulse" : ""}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    opacity: loading || !input.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
