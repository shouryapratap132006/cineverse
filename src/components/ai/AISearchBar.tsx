"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

interface AISearchBarProps {
  onSearch: (query: string, mode: "traditional" | "ai") => void;
  isLoading?: boolean;
}

export default function AISearchBar({ onSearch, isLoading = false }: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"traditional" | "ai">("ai");

  const examplePrompts = [
    "Movies like Interstellar but emotional",
    "Movies with unreliable narrators",
    "Best cinematography",
    "Time travel without paradoxes",
    "Movies where the villain wins",
    "Beautiful rainy movies"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query, searchMode);
  };

  const handleChipClick = (prompt: string) => {
    setQuery(prompt);
    setSearchMode("ai");
    onSearch(prompt, "ai");
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Mode Toggle Button */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setSearchMode("traditional")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              searchMode === "traditional"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Traditional
          </button>
          <button
            onClick={() => setSearchMode("ai")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              searchMode === "ai"
                ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-md shadow-brand-purple/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Search
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            searchMode === "ai"
              ? "Describe the vibe, narrative, or aesthetic you're looking for..."
              : "Search movies by title, director, cast..."
          }
          className={`w-full pl-5 pr-14 py-4 rounded-2xl bg-slate-900/60 border text-slate-100 text-xs md:text-sm placeholder-slate-500 focus:outline-none transition-all shadow-xl backdrop-blur-xl ${
            searchMode === "ai"
              ? "border-brand-purple/30 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/30"
              : "border-white/10 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/35"
          }`}
        />

        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className={`absolute right-3 p-2.5 rounded-xl text-white transition disabled:opacity-40 cursor-pointer ${
            searchMode === "ai"
              ? "bg-gradient-to-r from-brand-blue to-brand-purple shadow-lg shadow-brand-purple/20 hover:opacity-95"
              : "bg-brand-blue hover:opacity-95"
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Suggested chips (Only in AI Mode) */}
      <AnimatePresence>
        {searchMode === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Or try these prompts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handleChipClick(p)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-purple text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
