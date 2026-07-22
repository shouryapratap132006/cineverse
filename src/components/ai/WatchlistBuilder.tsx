"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, BookOpen, Share2, Download, Save, Clock, ArrowRight, CheckCircle2, Circle } from "lucide-react";

interface WatchlistMovie {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  runtime?: number;
  reason: string;
  orderNote: string;
}

interface GeneratedWatchlist {
  name: string;
  description: string;
  mood: string;
  emoji: string;
  movies: WatchlistMovie[];
  estimatedRuntime: number;
}

export default function WatchlistBuilder() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [watchlist, setWatchlist] = useState<GeneratedWatchlist | null>(null);
  const [selections, setSelections] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setWatchlist(null);
    setSelections({});

    try {
      const res = await fetch("/api/ai/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Watchlist generation failed (${res.status})`);
      }
      setWatchlist(data);
      if (data?.movies) {
        const next: Record<string, boolean> = {};
        data.movies.forEach((m: any) => {
          next[m.tmdbId] = true;
        });
        setSelections(next);
      }
    } catch (e) {
      console.error(e);
      triggerToast(
        e instanceof Error ? e.message : "Failed to generate custom watchlist."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (movieId: string) => {
    setSelections((prev) => ({ ...prev, [movieId]: !prev[movieId] }));
  };

  const toggleSelectAll = () => {
    if (!watchlist) return;
    const allSelected = watchlist.movies.every((m) => selections[m.tmdbId]);
    const next: Record<string, boolean> = {};
    watchlist.movies.forEach((m) => {
      next[m.tmdbId] = !allSelected;
    });
    setSelections(next);
  };

  const handleSave = async () => {
    if (!watchlist || isSaving) return;
    const selectedList = watchlist.movies.filter((m) => selections[m.tmdbId]);
    if (selectedList.length === 0) {
      triggerToast("No movies selected to add to watchlist!");
      return;
    }

    setIsSaving(true);
    try {
      const { addMoviesToWatchlist } = await import("@/actions/watchlist");
      const payload = selectedList.map((m) => ({
        id: m.tmdbId,
        title: m.title,
        posterPath: m.posterPath || ""
      }));
      const res = await addMoviesToWatchlist(payload, "WANT_TO_WATCH");
      if (res.success) {
        triggerToast(`Added ${selectedList.length} movies to your Watchlist!`);
      } else {
        triggerToast(res.error || "Failed to add movies.");
      }
    } catch (e) {
      console.error(e);
      triggerToast("Failed to save movies.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast("Watchlist link copied to clipboard!");
  };

  const handleExport = () => {
    if (!watchlist) return;
    const text = `CineVerse Watchlist: ${watchlist.emoji} ${watchlist.name}\n${watchlist.description}\n\n` +
      watchlist.movies.map((m, idx) => `${idx + 1}. ${m.title} (${m.year})\n- Reason: ${m.reason}\n- Note: ${m.orderNote}`).join("\n\n");

    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${watchlist.name.toLowerCase().replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerToast("Watchlist exported as TXT!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Toast Alert */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white shadow-xl backdrop-blur-md"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input query form */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-xl backdrop-blur-xl space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            Watchlist Builder
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Specify a scenario, theme, or mood. We'll program a cohesive cinematic experience.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex gap-2 relative items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'A rainy Sunday afternoon with cerebral sci-fi', 'Nihilistic movies where the villain wins'"
            className="flex-1 pl-4 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple transition-all"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white disabled:opacity-40 transition cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>

      {/* Output results */}
      {watchlist && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl bg-slate-900/40 border border-white/5 shadow-2xl backdrop-blur-xl space-y-6"
        >
          {/* Header metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{watchlist.emoji}</span>
                <h3 className="text-xl font-black text-white tracking-tight">{watchlist.name}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{watchlist.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  Mood: {watchlist.mood}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {Math.round(watchlist.estimatedRuntime / 60)} hrs runtime
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-xs font-bold text-white shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : `Add Selected (${watchlist.movies.filter((m) => selections[m.tmdbId]).length})`}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Selection Stats and Select All bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400">
            <button
              onClick={toggleSelectAll}
              className="hover:text-white transition flex items-center gap-2 cursor-pointer select-none"
            >
              {watchlist.movies.every((m) => selections[m.tmdbId]) ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-brand-purple" />
              ) : (
                <Circle className="w-4.5 h-4.5 text-slate-500" />
              )}
              {watchlist.movies.every((m) => selections[m.tmdbId]) ? "Deselect All" : "Select All"}
            </button>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-black">
              {watchlist.movies.filter((m) => selections[m.tmdbId]).length} of {watchlist.movies.length} selected
            </span>
          </div>

          {/* List of films */}
          <div className="space-y-4">
            {watchlist.movies.map((movie, idx) => {
              const posterUrl = movie.posterPath
                ? `/api/tmdb/img?path=/t/p/w185${movie.posterPath}`
                : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200";
              const isSelected = !!selections[movie.tmdbId];

              return (
                <div
                  key={movie.tmdbId}
                  onClick={() => toggleSelect(movie.tmdbId)}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-slate-900/60 border-brand-purple/40"
                      : "bg-slate-950/40 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-purple" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                    )}
                  </div>
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl bg-slate-900 shrink-0"
                  />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white truncate">
                          {idx + 1}. {movie.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {movie.year} • {movie.genres.slice(0, 2).join(", ")}
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple shrink-0 select-none uppercase tracking-wider">
                        {movie.orderNote}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{movie.overview}</p>
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                        "{movie.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
