"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Globe, Compass, Activity, Film } from "lucide-react";

interface GenreBreakdown {
  genre: string;
  percentage: number;
  color: string;
}

interface MovieDNAProps {
  dna: {
    personality: string;
    personalityDescription: string;
    tasteScore: number;
    topGenres: GenreBreakdown[];
    topDirectors: string[];
    topActors: string[];
    topThemes: string[];
    favoriteCountries: string[];
    visualStyle: string[];
    pacing: string;
    favoritDecade: string;
    moodBoard: string[];
    profileSummary: string;
    stats: {
      moviesWatched: number;
      reviewsWritten: number;
      averageRating: number;
      mostWatchedGenre: string;
    };
  };
}

export default function MovieDNACard({ dna }: MovieDNAProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {/* Col 1: Personality Card (The Hero Card) */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-2 relative flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-gradient-to-br from-brand-purple/20 via-slate-900/80 to-brand-blue/10 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-[380px]"
      >
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
            <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">
              Cinematic Personality
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {dna.personality}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-xl">
              {dna.personalityDescription}
            </p>
          </div>
        </div>

        {/* DNA Summary Text Block */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 mt-6">
          <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-widest uppercase">
            Auteur Narrative Summary
          </span>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{dna.profileSummary}"
          </p>
        </div>

        {/* Quick metrics footer */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 mt-6">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Watched</span>
            <p className="text-lg font-black text-white">{dna.stats.moviesWatched} films</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Reviews</span>
            <p className="text-lg font-black text-white">{dna.stats.reviewsWritten} entries</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Avg Rating</span>
            <p className="text-lg font-black text-white">{dna.stats.averageRating}/10</p>
          </div>
        </div>
      </motion.div>

      {/* Col 2: Taste Score Ring */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-transparent to-transparent -z-10" />

        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-6">
          Cinephile Taste Score
        </span>

        {/* Circular Progress Gauge */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="68"
              stroke="url(#gradient)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 68}
              initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - dna.tasteScore / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Core Score Number */}
          <div className="absolute flex flex-col items-center justify-center space-y-0.5">
            <span className="text-3xl font-black text-white">{dna.tasteScore}</span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-semibold text-center mt-6 leading-relaxed">
          Your curation depth outperforms {dna.tasteScore}% of global movie logs. Keep reviews high!
        </p>
      </motion.div>

      {/* Row 2 Col 1: Genre Breakdown */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-xl space-y-4"
      >
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
          Genre Matrix
        </span>
        <div className="space-y-3">
          {dna.topGenres.map((g) => (
            <div key={g.genre} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>{g.genre}</span>
                <span>{g.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: g.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 2 Col 2: Cinematic Style & Pacing */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-xl flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-4">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Aesthetic Styles
          </span>
          <div className="flex flex-wrap gap-1.5">
            {dna.visualStyle.map((style) => (
              <span
                key={style}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300"
              >
                {style}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold text-slate-300">Pacing: {dna.pacing}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-blue" />
            <span className="text-xs font-bold text-slate-300">Era: {dna.favoritDecade}</span>
          </div>
        </div>
      </motion.div>

      {/* Row 2 Col 3: Preferred Directors & Themes */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-xl space-y-4"
      >
        <div className="space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Top Directors
          </span>
          <div className="space-y-1.5">
            {dna.topDirectors.map((director, idx) => (
              <div key={director} className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <span className="text-slate-500 font-extrabold">0{idx + 1}</span>
                <span>{director}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
            Key Themes
          </span>
          <div className="flex flex-wrap gap-1">
            {dna.topThemes.map((theme) => (
              <span
                key={theme}
                className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/5"
              >
                #{theme}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
