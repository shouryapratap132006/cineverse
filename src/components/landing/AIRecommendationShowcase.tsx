"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Film, HelpCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

interface Recommendation {
  title: string;
  year: number;
  rating: number;
  mood: string;
  reason: string;
  poster: string;
  streaming: string[];
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    title: "Arrival",
    year: 2016,
    rating: 8.4,
    mood: "Melancholic, Thought-provoking, Intellectual",
    reason: "Like Interstellar, it links advanced sci-fi concepts (linguistic relativity and time) with an incredibly emotional, heart-wrenching parent-child relationship. Sweeping score and beautiful cinematography.",
    poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200",
    streaming: ["Paramount+", "Prime Video"]
  },
  {
    title: "Contact",
    year: 1997,
    rating: 7.5,
    mood: "Awe-inspiring, Scientific, Emotional",
    reason: "Directed by Robert Zemeckis, this classic is the direct spiritual predecessor to Interstellar. It deals with space travel and first contact, but is anchored by the protagonist's love for her late father.",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200",
    streaming: ["Max", "Apple TV+"]
  }
];

export default function AIRecommendationShowcase() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string; recs?: Recommendation[] }>>([]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Stage 1: Initial empty state
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
        setMessages([{ role: "user", text: "I want a movie like Interstellar but emotional..." }]);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Stage 2: AI starts answering
    if (step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Searching catalog for mind-bending sci-fi with profound emotional resonance... Here are two exceptional recommendations tailored to your mood:"
          }
        ]);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Stage 3: Recommendation cards appear
    if (step === 2) {
      const timer = setTimeout(() => {
        setStep(3);
        setMessages((prev) => {
          const updated = [...prev];
          updated[1] = {
            ...updated[1],
            recs: RECOMMENDATIONS
          };
          return updated;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const restartDemo = () => {
    setMessages([]);
    setStep(0);
  };

  return (
    <section id="ai-recommendations" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left: Presentation Text */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purple font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CineCompanion</span>
          </div>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight">
            Stop Scrolling. <br />
            Start Watching.
          </h2>
          <p className="text-slate-400 font-light leading-relaxed">
            Our AI Companion parses semantic themes, mood profiles, director styles, and soundtrack vibes to deliver perfect matches in natural language.
          </p>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-300 font-bold">1</div>
              <div>
                <h4 className="text-sm font-bold text-white">Ask in Plain English</h4>
                <p className="text-xs text-slate-400">Describe the specific vibe, emotions, or references you want.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-300 font-bold">2</div>
              <div>
                <h4 className="text-sm font-bold text-white">Contextual Explanations</h4>
                <p className="text-xs text-slate-400">Learn precisely why each movie maps to your prompt.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5">
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-300 font-bold">3</div>
              <div>
                <h4 className="text-sm font-bold text-white">Streaming availability</h4>
                <p className="text-xs text-slate-400">Find exactly where to watch the recommendations immediately.</p>
              </div>
            </div>
          </div>

          <button
            onClick={restartDemo}
            className="text-xs font-bold text-brand-blue hover:text-brand-purple cursor-pointer underline underline-offset-4 pt-2 block"
          >
            Replay Chat Simulation
          </button>
        </div>

        {/* Right: Mock Chatbot Interface */}
        <div className="lg:col-span-7 w-full">
          <GlassCard hoverGlow={false} className="p-0 border-white/10 overflow-hidden shadow-2xl h-[560px] flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 bg-slate-950/40 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/35 text-brand-purple flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI CineCompanion</h4>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
              <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
            </div>

            {/* Chat Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6 scrollbar-thin">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm font-light leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand-blue/20 border border-brand-blue/30 text-white rounded-tr-none"
                          : "bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Recommendation Cards */}
                    {msg.recs && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full"
                      >
                        {msg.recs.map((rec) => (
                          <div
                            key={rec.title}
                            className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 relative flex flex-col justify-between"
                          >
                            <div className="space-y-2.5">
                              {/* Movie Header */}
                              <div className="flex items-center space-x-3">
                                <img
                                  src={rec.poster}
                                  alt={rec.title}
                                  className="w-12 h-16 object-cover rounded-lg border border-white/10"
                                />
                                <div>
                                  <h4 className="text-xs font-bold text-white">{rec.title} <span className="text-[10px] text-slate-500 font-normal">({rec.year})</span></h4>
                                  <div className="flex items-center text-[10px] text-brand-gold font-bold mt-0.5">
                                    <Star className="w-3 h-3 fill-brand-gold text-brand-gold mr-0.5" />
                                    <span>{rec.rating} / 10</span>
                                  </div>
                                </div>
                              </div>

                              {/* Mood Badges */}
                              <p className="text-[9px] font-semibold text-brand-purple leading-tight">
                                Mood: {rec.mood}
                              </p>

                              {/* Explanation */}
                              <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                                {rec.reason}
                              </p>
                            </div>

                            {/* Streaming platforms */}
                            <div className="border-t border-white/5 pt-2.5 mt-3.5 flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 uppercase font-semibold">Stream on</span>
                              <div className="flex space-x-1.5">
                                {rec.streaming.map((provider) => (
                                  <span
                                    key={provider}
                                    className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/5 border border-white/10 text-slate-300"
                                  >
                                    {provider}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Chat Input Footer */}
            <div className="p-4 bg-slate-950/40 border-t border-white/5 flex items-center space-x-3">
              <input
                type="text"
                readOnly
                placeholder={step === 0 ? "Typing..." : "Message CineCompanion..."}
                className="w-full py-2.5 px-4 rounded-xl glass-input text-xs cursor-not-allowed opacity-80"
              />
              <button
                disabled
                className="py-2.5 px-4 bg-brand-purple/20 text-brand-purple border border-brand-purple/30 rounded-xl text-xs font-semibold opacity-50 cursor-not-allowed"
              >
                Send
              </button>
            </div>

          </GlassCard>
        </div>

      </div>
    </section>
  );
}
