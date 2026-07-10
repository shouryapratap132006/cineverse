"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Search,
  Pin,
  Folder,
  Trash2,
  Edit3,
  Check,
  Plus,
  MessageSquare,
  ChevronRight,
  Menu,
  X,
  FolderPlus
} from "lucide-react";
import { marked } from "marked";
import AITypingIndicator from "./AITypingIndicator";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

interface ChatSession {
  id: string;
  title: string;
  type: string;
  isPinned: boolean;
  folderId?: string;
  messages: Message[];
  updatedAt: string;
}

interface FolderType {
  id: string;
  name: string;
}

export default function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([
    { id: "favorites", name: "Favorites" },
    { id: "learning", name: "Film School" }
  ]);
  
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on load
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.conversations);
        if (data.conversations.length > 0 && !activeSessionId) {
          setActiveSessionId(data.conversations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createNewSession = async (title = "New Discussion", type = "general") => {
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type })
      });
      if (res.ok) {
        const newSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText ?? input;
    if (!textToSend.trim() || isLoading) return;

    let currentSessionId = activeSessionId;

    // If no active session, create one first
    if (!currentSessionId) {
      try {
        const res = await fetch("/api/ai/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: textToSend.substring(0, 30), type: "general" })
        });
        if (res.ok) {
          const newSession = await res.json();
          setSessions((prev) => [newSession, ...prev]);
          currentSessionId = newSession.id;
          setActiveSessionId(newSession.id);
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }

    if (!currentSessionId) return;

    // Optimistic message update
    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...(activeSession?.messages ?? []), userMessage];
    
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, messages: updatedMessages } : s
      )
    );
    setInput("");
    setIsLoading(true);

    try {
      // Send chat message request
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieTitle: "Cineverse AI",
          movieOverview: "General cinema discussions",
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantResponseText = "";

      // Add placeholder assistant message
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...updatedMessages, { role: "assistant", content: "" }]
              }
            : s
        )
      );

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
                assistantResponseText += data.delta;

                // Update assistant response text in state
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === currentSessionId
                      ? {
                          ...s,
                          messages: [
                            ...updatedMessages,
                            { role: "assistant", content: assistantResponseText }
                          ]
                        }
                      : s
                  )
                );
              } catch (e) {
                // Ignore parsing errors of partial lines
              }
            }
          }
        }
      }

      // Persist final conversation to server
      const finalMessages = [...updatedMessages, { role: "assistant", content: assistantResponseText }];
      await fetch("/api/ai/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentSessionId, messages: finalMessages })
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameSession = async (id: string) => {
    if (!editTitleInput.trim()) return;
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitleInput })
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: editTitleInput } : s))
        );
        setEditingSessionId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/api/ai/conversations?id=${id}`, {
        method: "DELETE"
      });
      // In-memory removal fallback if api is stub
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePin = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find((s) => s.id === id);
    if (!session) return;
    const isPinned = !session.isPinned;
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned })
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isPinned } : s))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.isPinned);

  const starterChips = [
    { label: "Recommend French New Wave films", text: "What are the best films of the French New Wave style?" },
    { label: "Explain Kubrick's lighting style", text: "Explain how Stanley Kubrick used lighting to create moods." },
    { label: "Analyze cinematography of Vertigo", text: "Analyze the camera work and cinematography in Alfred Hitchcock's Vertigo." },
    { label: "What is Auteur theory?", text: "Explain the Auteur Theory using real film director examples." }
  ];

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 rounded-xl bg-slate-900 border border-white/10 text-white lg:hidden hover:bg-slate-800 transition"
      >
        {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar List */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 lg:static z-40 w-72 h-full bg-slate-900/40 border-r border-white/5 backdrop-blur-xl flex flex-col p-4 pt-16 lg:pt-4"
          >
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => createNewSession()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-xs font-bold text-white hover:opacity-95 transition cursor-pointer shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition cursor-pointer">
                <FolderPlus className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Search sessions */}
            <div className="relative mb-4">
              <Search className="absolute top-2.5 left-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple transition"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <Pin className="w-3 h-3 rotate-45" /> Pinned
                  </div>
                  {pinnedSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        activeSessionId === s.id
                          ? "bg-gradient-to-r from-brand-blue/15 to-brand-purple/15 border-l-2 border-brand-purple text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 mr-2">
                        <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
                        {editingSessionId === s.id ? (
                          <input
                            type="text"
                            value={editTitleInput}
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onBlur={() => handleRenameSession(s.id)}
                            onKeyDown={(e) => e.key === "Enter" && handleRenameSession(s.id)}
                            className="bg-transparent border-b border-brand-purple text-white outline-none w-full py-0.5"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{s.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(s.id);
                            setEditTitleInput(s.title);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleTogglePin(s.id, e)}
                          className="p-1 text-brand-purple hover:text-white transition"
                        >
                          <Pin className="w-3 h-3 rotate-45" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 text-slate-400 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat list */}
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Discussions
                </div>
                {unpinnedSessions.length > 0 ? (
                  unpinnedSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setActiveSessionId(s.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        activeSessionId === s.id
                          ? "bg-gradient-to-r from-brand-blue/15 to-brand-purple/15 border-l-2 border-brand-purple text-white"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 mr-2">
                        <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                        {editingSessionId === s.id ? (
                          <input
                            type="text"
                            value={editTitleInput}
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onBlur={() => handleRenameSession(s.id)}
                            onKeyDown={(e) => e.key === "Enter" && handleRenameSession(s.id)}
                            className="bg-transparent border-b border-brand-purple text-white outline-none w-full py-0.5"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{s.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(s.id);
                            setEditTitleInput(s.title);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleTogglePin(s.id, e)}
                          className="p-1 text-slate-500 hover:text-brand-purple transition"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(s.id, e)}
                          className="p-1 text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 px-3 py-2 italic">No chats yet</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat section */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/60 overflow-hidden relative">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-6 pt-20 lg:pt-8">
          {activeSession && activeSession.messages.length > 0 ? (
            activeSession.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-4 max-w-3xl ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                    m.role === "user"
                      ? "bg-slate-800 text-slate-300 border border-white/10"
                      : "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md shadow-brand-purple/20"
                  }`}
                >
                  {m.role === "user" ? "U" : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed backdrop-blur-md border ${
                    m.role === "user"
                      ? "bg-brand-purple/10 border-brand-purple/20 text-slate-100 rounded-tr-none"
                      : "bg-white/5 border-white/10 text-slate-200 rounded-tl-none prose prose-invert prose-xs"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: marked.parseSync(m.content)
                  }}
                />
              </div>
            ))
          ) : (
            /* Blank state */
            <div className="max-w-2xl mx-auto my-20 space-y-8 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <Sparkles className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">CineVerse Intelligence Companion</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Discuss film history, request custom recommendations, deep dive into cinematography, or explore color theory.
                </p>
              </div>

              {/* Suggestions chips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-left">
                {starterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, chip.text)}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-purple/50 text-xs font-semibold text-slate-300 hover:text-white transition-all hover:bg-slate-900/60 flex items-center justify-between group cursor-pointer text-left"
                  >
                    <span>{chip.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-purple transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-4 max-w-3xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-blue to-brand-purple flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <AITypingIndicator />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about movies or cinema history..."
              className="flex-1 pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/50 transition-all backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-2 text-[10px] text-slate-600 text-center select-none">
            Powered by Groq GPT OSS 120B. Insights are simulated for cinematic review.
          </div>
        </div>
      </div>
    </div>
  );
}
