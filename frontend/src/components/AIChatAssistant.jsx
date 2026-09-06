import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { queryLLMApi } from "../services/llmService.js";

// Formatted Message Renderer for Step-by-step Assistant Answers
const FormattedMessageText = ({ text }) => {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-xs text-slate-800 font-medium">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Numbered steps parser (Step 1:, 1., Step 2:, 2., etc.)
        const stepMatch = trimmed.match(/^(?:Step\s*(\d+)[:\.]?|(\d+)[\.\)])\s*(.*)/i);
        if (stepMatch) {
          const stepNum = stepMatch[1] || stepMatch[2];
          const stepContent = stepMatch[3];
          return (
            <div
              key={index}
              className="flex items-start space-x-2.5 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 my-2 shadow-2xs"
            >
              <span className="bg-[#1E3A8A] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {stepNum}
              </span>
              <div className="flex-1 text-slate-800 text-xs leading-relaxed font-semibold">
                {renderInlineFormatted(stepContent)}
              </div>
            </div>
          );
        }

        // Bullet point line (- or * or •)
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
          const bulletContent = trimmed.substring(2);
          return (
            <div key={index} className="flex items-start space-x-2 pl-1 my-1">
              <span className="text-[#1E3A8A] font-bold text-xs leading-none mt-1">•</span>
              <span className="flex-1 text-slate-700 font-semibold">{renderInlineFormatted(bulletContent)}</span>
            </div>
          );
        }

        // Headline / Bold title line (**Heading**)
        if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
          return (
            <h4 key={index} className="font-black text-[#1E3A8A] text-[13px] tracking-tight mt-2.5 mb-1 border-b border-blue-100 pb-1">
              {trimmed.replace(/\*\*/g, "")}
            </h4>
          );
        }

        // Default text line
        return (
          <p key={index} className="leading-relaxed">
            {renderInlineFormatted(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Inline formatter for bold text and route badges (/invoices, /sales-orders)
const renderInlineFormatted = (str) => {
  if (!str) return null;
  const parts = str.split(/(\*\*[^*]+\*\*|\/[a-zA-Z0-9_-]+(?:\?[a-zA-Z0-9_=&-]+)?)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-black text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("/")) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-blue-100 text-[#1E3A8A] font-mono text-[11px] font-bold border border-blue-200"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Type any ERP task or feature name to view step-by-step navigation instructions:",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    try {
      const replyText = await queryLLMApi(query, messages);
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Assistant response error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-['Lato',sans-serif]">
      {/* Circle Floating Button in Bottom Right Corner - Logo & Tag Only */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-[#1E3A8A] hover:bg-[#152e70] text-white shadow-2xl flex items-center justify-center border-2 border-white/30 transition-all cursor-pointer relative"
          aria-label="Open Finora ERP Assistant"
          title="Finora Copilot"
        >
          <div className="relative flex items-center justify-center">
            <i className="fa-solid fa-robot text-2xl"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#1E3A8A] rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#1E3A8A] rounded-full"></span>
          </div>
        </motion.button>
      )}

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-[92vw] sm:w-[420px] h-[570px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-[#1E3A8A] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 relative">
                  <i className="fa-solid fa-robot text-white text-lg"></i>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1E3A8A]"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">Finora ERP Copilot</h3>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close Chat"
              >
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#1E3A8A] text-white rounded-br-none shadow-xs font-medium"
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      <FormattedMessageText text={msg.text} />
                    )}
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        msg.sender === "user" ? "text-blue-200" : "text-slate-400 font-semibold"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 text-xs shadow-2xs flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-[#1E3A8A] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask how to do tasks in Finora ERP..."
                className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-[#1E3A8A] hover:bg-[#152e70] disabled:opacity-40 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatAssistant;

