"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import AIMovieCard from "./AIMovieCard";

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

interface RecommendationRowProps {
  title: string;
  subtitle: string;
  emoji: string;
  movies: RecommendedMovie[];
  onAddToWatchlist?: (id: string) => void;
}

export default function RecommendationRow({
  title,
  subtitle,
  emoji,
  movies,
  onAddToWatchlist
}: RecommendationRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="space-y-3 group relative">
      {/* Title & Subtitle */}
      <div className="flex items-end justify-between px-1">
        <div className="space-y-0.5">
          <h3 className="text-base md:text-lg font-extrabold text-white flex items-center gap-1.5 tracking-tight">
            <span>{emoji}</span>
            <span>{title}</span>
            <Sparkles className="w-4 h-4 text-brand-blue/70" />
          </h3>
          <p className="text-xs text-slate-400 font-semibold">{subtitle}</p>
        </div>

        {/* Scroll Controls */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movie Row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {movies.map((movie) => (
          <div
            key={movie.tmdbId}
            className="w-[240px] sm:w-[280px] shrink-0 snap-start"
          >
            <AIMovieCard movie={movie} onAddToWatchlist={onAddToWatchlist} />
          </div>
        ))}
      </div>
    </div>
  );
}
