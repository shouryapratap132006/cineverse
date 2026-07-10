"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Languages, Check, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

interface ReviewAssistantProps {
  content: string;
  movieTitle?: string;
  onApplyChange: (newContent: string) => void;
}

type ActionType =
  | "improve"
  | "expand"
  | "shorten"
  | "professional"
  | "funny"
  | "spoiler_free"
  | "grammar"
  | "translate"
  | "generate_title"
  | "summarize";

export default function ReviewAssistant({
  content,
  movieTitle = "",
  onApplyChange
}: ReviewAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");

  const actions: Array<{ id: ActionType; label: string; icon: string; desc: string }> = [
    { id: "improve", label: "Polish", icon: "✨", desc: "Refines grammar, clarity, & impact" },
    { id: "expand", label: "Elaborate", icon: "📝", desc: "Adds scene analyses & structure depth" },
    { id: "shorten", label: "Condense", icon: "✂️", desc: "Trims text to core insights" },
    { id: "professional", label: "Formal Critique", icon: "🎩", desc: "Formats into academic style" },
    { id: "funny", label: "Cynic / Humorous", icon: "🎭", desc: "Injects witty critiques" },
    { id: "spoiler_free", label: "Purge Spoilers", icon: "🛡️", desc: "Obfuscates major plot endings" },
    { id: "grammar", label: "Grammar Fix", icon: "✍️", desc: "Corrects syntax & spelling" },
    { id: "translate", label: "Translate", icon: "🌐", desc: "Translates review content" },
    { id: "generate_title", label: "Review Titles", icon: "🏷️", desc: "Suggests headline tags" },
    { id: "summarize", label: "Verdict Summary", icon: "📊", desc: "Synthesizes review to summary sentences" }
  ];

  const handleAction = async (action: ActionType) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setAiPreview(null);

    try {
      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          action,
          movieTitle,
          targetLanguage: action === "translate" ? selectedLanguage : undefined
        })
      });

      if (!res.ok) {
        throw new Error("Review processing failed");
      }

      const data = await res.json();
      setAiPreview(data.result);
    } catch (e) {
      console.error(e);
      setErrorMessage("Could not process review changes. Ensure review text is not empty.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <h4 className="text-xs font-extrabold text-white tracking-wider uppercase">
            AI Review Assistant
          </h4>
        </div>

        {/* Translation Language Selector */}
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent border border-white/10 rounded px-1 py-0.5 text-[10px] text-slate-400 focus:outline-none"
          >
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>
        </div>
      </div>

      {/* Grid of Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => handleAction(act.id)}
            disabled={!content.trim() || isLoading}
            title={act.desc}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-brand-purple/50 text-slate-300 hover:text-white transition disabled:opacity-40 cursor-pointer"
          >
            <span className="text-sm mb-1">{act.icon}</span>
            <span className="text-[10px] font-bold text-center">{act.label}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-400">Reviewing draft parameters...</span>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview Section */}
      <AnimatePresence>
        {aiPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">
                AI Suggestion Preview
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAiPreview(null)}
                  className="p-1 rounded bg-slate-900 border border-white/5 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Discard"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onApplyChange(aiPreview);
                    setAiPreview(null);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-gradient-to-r from-brand-blue to-brand-purple text-[10px] font-bold text-white transition cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Accept Draft
                </button>
              </div>
            </div>

            <div className="max-h-[160px] overflow-y-auto pr-1">
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {aiPreview}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
