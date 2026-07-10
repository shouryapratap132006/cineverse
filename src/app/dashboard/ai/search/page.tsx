"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import AISearchBar from "@/components/ai/AISearchBar";
import AIMovieCard from "@/components/ai/AIMovieCard";

interface SemanticMovieResult {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  confidence: number;
  whyRecommended: string;
  tags: string[];
}

interface SemanticSearchResult {
  movies: SemanticMovieResult[];
  relatedSearches: string[];
  explanation: string;
}

export default function SemanticSearchPage() {
  const [results, setResults] = useState<SemanticSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string, mode: "traditional" | "ai") => {
    setIsLoading(true);
    setResults(null);
    setLastQuery(query);

    try {
      // In a real app, traditional mode might call regular search.
      // For Cineverse AI Phase 4, we use semantic route.
      const endpoint = "/api/ai/search";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatchlist = async (movieId: string) => {
    // TMDB watchlist mock add
    console.log(`Add ${movieId} to user watchlist`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ai"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Hub
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <Sparkles className="w-5 h-5 text-brand-purple" />
          <h1 className="text-lg font-black text-white tracking-tight">Semantic search</h1>
        </div>
      </div>

      {/* AISearchBar Container */}
      <AISearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* Results grid */}
      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-8"
          >
            {/* Search explanation note */}
            {results.explanation && (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[9px] font-bold text-brand-blue tracking-widest uppercase">
                  Search Philosophy
                </span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{results.explanation}"
                </p>
              </div>
            )}

            {/* Grid list of movies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.movies.map((movie) => (
                <AIMovieCard
                  key={movie.tmdbId}
                  movie={movie}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))}
            </div>

            {/* Related search topics list */}
            {results.relatedSearches.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-white/5">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  Related AI Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {results.relatedSearches.map((rel) => (
                    <button
                      key={rel}
                      onClick={() => handleSearch(rel, "ai")}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-purple text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
