"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import RecommendationRow from "@/components/ai/RecommendationRow";

interface RecommendedMovie {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  rating?: number;
  whyRecommended: string;
  matchScore: number;
}

interface RecommendationSet {
  type: string;
  title: string;
  subtitle: string;
  emoji: string;
  movies: RecommendedMovie[];
}

export default function RecommendationPage() {
  const [recSets, setRecSets] = useState<RecommendationSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // Fetch 4 key curated sections to save latency, or compile all
      const categories = [
        "today_pick",
        "hidden_gems",
        "mind_bending",
        "weekend_marathon",
        "comfort_movies",
        "international"
      ];
      
      const results = await Promise.all(
        categories.map(async (cat) => {
          const res = await fetch("/api/ai/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: cat })
          });
          if (res.ok) return res.json();
          return null;
        })
      );

      setRecSets(results.filter((r) => r !== null) as RecommendationSet[]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatchlist = (movieId: string) => {
    console.log(`Add ${movieId} to watchlist`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header */}
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
          <h1 className="text-lg font-black text-white tracking-tight">AI Recommendations</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Consulting Taste Graph Parameters...
          </span>
        </div>
      ) : (
        <div className="space-y-10">
          {recSets.map((set) => (
            <RecommendationRow
              key={set.type}
              title={set.title}
              subtitle={set.subtitle}
              emoji={set.emoji}
              movies={set.movies}
              onAddToWatchlist={handleAddToWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
