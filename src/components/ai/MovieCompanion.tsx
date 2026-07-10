"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, HelpCircle, ArrowRight, MessageSquare } from "lucide-react";
import { marked } from "marked";
import AITypingIndicator from "./AITypingIndicator";

interface MovieCompanionProps {
  movieId: string;
  movieTitle: string;
  movieOverview?: string;
  genres?: string[];
  director?: string;
  year?: number;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function MovieCompanion({
  movieId,
  movieTitle,
  movieOverview = "",
  genres = [],
  director = "",
  year
}: MovieCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Explain the ending",
    "Hidden symbolism",
    "Director inspiration",
    "Cinematography style",
    "Behind the scenes",
    "Soundtrack analysis"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText ?? input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          movieTitle,
          movieOverview,
          genres,
          director,
          year,
          messages: updatedMessages
        })
      });

      if (!response.ok) throw new Error("Assistant request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      // Add temporary blank assistant message
      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.done) break;
                assistantText += data.delta;

                setMessages([...updatedMessages, { role: "assistant", content: assistantText }]);
              } catch (e) {
                // Ignore parsing errors of partial lines
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages([...updatedMessages, { role: "assistant", content: "Apologies, I encountered an issue analyzing this film right now. Please try again soon." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-xl shadow-brand-purple/20 border border-white/10 font-bold text-xs cursor-pointer"
      >
        <Sparkles className="w-4.5 h-4.5 animate-pulse" />
        <span>Ask Film Companion</span>
      </motion.button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Film Companion</h3>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    Analyzing: {movieTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                /* Starter State */
                <div className="space-y-4 my-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-wider uppercase">
                      Welcome Cinephile
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      I'm your assistant for **{movieTitle}**. Ask me about the ending, camera techniques, color schemes, or narrative symbolism.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Suggested Prompts
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSendMessage(undefined, q)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-purple text-[10px] font-semibold text-slate-300 hover:text-white transition cursor-pointer text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                        m.role === "user"
                          ? "bg-slate-800 text-slate-300 border border-white/5"
                          : "bg-gradient-to-r from-brand-blue to-brand-purple text-white"
                      }`}
                    >
                      {m.role === "user" ? "U" : "AI"}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed border ${
                        m.role === "user"
                          ? "bg-brand-purple/10 border-brand-purple/20 text-slate-100 rounded-tr-none"
                          : "bg-white/5 border-white/10 text-slate-200 rounded-tl-none prose prose-invert prose-xs"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(m.content) as string
                      }}
                    />
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <AITypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-white/5 bg-slate-900/20">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 pl-3 pr-9 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/35 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
