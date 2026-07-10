"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

interface AIMovieCardProps {
  movie: {
    tmdbId: string;
    title: string;
    year: number;
    posterPath: string;
    overview: string;
    genres: string[];
    confidence?: number;
    whyRecommended: string;
    matchScore?: number;
  };
  onAddToWatchlist?: (id: string) => void;
}

export default function AIMovieCard({ movie, onAddToWatchlist }: AIMovieCardProps) {
  const confidence = movie.confidence ?? movie.matchScore ?? 90;
  const posterUrl = movie.posterPath
    ? movie.posterPath.startsWith("http")
      ? movie.posterPath
      : `https://image.tmdb.org/t/p/w342${movie.posterPath}`
    : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl transition-all shadow-xl"
    >
      {/* Poster image container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Match / Confidence badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-md">
          <Sparkles className="w-3 h-3 text-brand-blue" />
          <span className="text-[10px] font-bold text-white tracking-wide">
            {confidence}% Match
          </span>
        </div>

        {/* Floating Quick Action */}
        {onAddToWatchlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToWatchlist(movie.tmdbId);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Details floating over poster */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex flex-wrap gap-1 mb-1.5">
            {movie.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/5 uppercase tracking-wider"
              >
                {g}
              </span>
            ))}
          </div>
          <h4 className="text-sm font-bold text-white leading-tight truncate">
            {movie.title}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold">{movie.year}</p>
        </div>
      </div>

      {/* Explanatory details content */}
      <div className="flex-1 flex flex-col p-4 space-y-3 bg-slate-950/40">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-widest uppercase">
              AI Insight
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-4">
            "{movie.whyRecommended}"
          </p>
        </div>

        <hr className="border-white/5" />

        <Link
          href={`/dashboard/movies/${movie.tmdbId}`}
          className="w-full py-2 text-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold text-white transition-all"
        >
          Explore Cinema Details
        </Link>
      </div>
    </motion.div>
  );
}
