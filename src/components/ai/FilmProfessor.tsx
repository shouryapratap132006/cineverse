"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Send, ArrowLeft, ArrowRight, HelpCircle, Trophy } from "lucide-react";
import { marked } from "marked";
import AITypingIndicator from "./AITypingIndicator";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function FilmProfessor() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const topicsList = [
    { id: "editing", label: "Editing & Montage", icon: "✂️", desc: "Montage theory, jump cuts, and temporal pacing." },
    { id: "color_theory", label: "Color Theory", icon: "🎨", desc: "Complementary palettes, emotional lighting tones." },
    { id: "shot_composition", label: "Shot Composition", icon: "📐", desc: "Rule of thirds, golden ratio framing patterns." },
    { id: "camera_angles", label: "Camera Angles", icon: "🎥", desc: "Low angles, Dutch tilts, and lens dynamics." },
    { id: "screenplay", label: "Screenplay Structure", icon: "📄", desc: "Three-act formulas, dialog subtext beats." },
    { id: "sound_design", label: "Sound & Foley", icon: "🎵", desc: "Diegetic soundscapes, sound bridges, score themes." }
  ];

  const suggestedQuestions: Record<string, string[]> = {
    editing: ["Explain Soviet Montage Theory", "How does Whiplash use fast cutting?", "What is a jump cut transition?"],
    color_theory: ["Color palette in Her (2013)", "Explain orange/blue cinematic contrast", "How color represents sadness in film"],
    shot_composition: ["What is symmetrical framing?", "Analyze framing in Wes Anderson films", "Rule of thirds vs Golden Ratio"],
    camera_angles: ["When to use a Dutch tilt?", "Psychology of low-angle shots", "Explain dolly zoom vertigo effect"],
    screenplay: ["What is a midpoint shift?", "How to write subtext in dialogue", "Hero's journey act breakdown"],
    sound_design: ["Diegetic vs Non-diegetic sound", "Analyze sound design in Dunkirk", "What is a sound bridge?"]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleStartLesson = (topicId: string) => {
    setSelectedTopic(topicId);
    const labelName = topicsList.find((t) => t.id === topicId)?.label || "Lesson";
    setMessages([
      {
        role: "assistant",
        content: `Welcome to **${labelName}** seminar! I am Professor Cine. 
        
I've set the discussion speed parameters to **${level}**. We will deconstruct structural mechanisms using iconic cinema examples. 
What cinematic sequence would you like to analyze or learn today?`
      }
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText ?? input;
    if (!textToSend.trim() || isLoading || !selectedTopic) return;

    const userMsg: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/film-professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          level,
          messages: updatedMessages
        })
      });

      if (!res.ok) throw new Error("Professor response failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

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
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages([...updatedMessages, { role: "assistant", content: "I encountered a minor lecture failure. Please rephrase." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          /* Topic Grid Selection */
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-xl">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-purple" />
                  Film Professor School
                </h2>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Deepen your screen literacy. Select a cinematic discipline to begin one-on-one lectures.
                </p>
              </div>

              {/* Difficulty selectors */}
              <div className="flex p-0.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-center">
                {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                      level === l ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topicsList.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleStartLesson(topic.id)}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-brand-purple/50 transition-all cursor-pointer group flex items-start gap-4"
                >
                  <span className="text-2xl p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-105 transition-transform">
                    {topic.icon}
                  </span>
                  <div className="space-y-1 flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-brand-purple transition">
                      {topic.label}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{topic.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-purple mt-1 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Classroom Chat View */
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col h-[520px] bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl"
          >
            {/* Class Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/20">
              <button
                onClick={() => setSelectedTopic(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Seminars
              </button>

              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {topicsList.find((t) => t.id === selectedTopic)?.icon}
                </span>
                <h3 className="text-xs font-extrabold text-white">
                  {topicsList.find((t) => t.id === selectedTopic)?.label} Seminar
                </h3>
              </div>

              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple uppercase tracking-wider">
                {level} level
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                      m.role === "user"
                        ? "bg-slate-800 text-slate-300 border border-white/5"
                        : "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow"
                    }`}
                  >
                    {m.role === "user" ? "U" : "P"}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-xl text-xs leading-relaxed border ${
                      m.role === "user"
                        ? "bg-brand-purple/10 border-brand-purple/20 text-slate-100 rounded-tr-none"
                        : "bg-white/5 border-white/10 text-slate-200 rounded-tl-none prose prose-invert prose-xs"
                    }`}
                    dangerouslySetInnerHTML={{
                      __html: marked.parseSync(m.content)
                    }}
                  />
                </div>
              ))}

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

            {/* Class Suggestions Footer */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-white/5 space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Suggested lecture questions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions[selectedTopic]?.map((q) => (
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
            )}

            {/* Form Input footer */}
            <div className="p-3 border-t border-white/5 bg-slate-950/20">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the Professor a question..."
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
    </div>
  );
}
