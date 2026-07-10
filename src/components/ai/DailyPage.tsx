"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, HelpCircle, Trophy, Sparkles, MessageSquare, Quote } from "lucide-react";
import Link from "next/link";

interface DailyContent {
  date: string;
  todaysMovie: {
    tmdbId?: string;
    title: string;
    year: number;
    posterPath?: string;
    whyToday: string;
    tagline: string;
    funFact: string;
  };
  todaysDirector: {
    name: string;
    birthYear?: number;
    nationality: string;
    notableWork: string;
    whyToday: string;
    quote?: string;
  };
  hiddenGem: {
    tmdbId?: string;
    title: string;
    year: number;
    posterPath?: string;
    whyToday: string;
    tagline: string;
    funFact: string;
  };
  challenge: {
    title: string;
    description: string;
    difficulty: string;
    reward: string;
    exampleMovies: string[];
  };
  quote: {
    quote: string;
    movie: string;
    character?: string;
    year: number;
  };
  discussion: {
    question: string;
    context: string;
    tags: string[];
  };
}

export default function DailyPage() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDaily();
  }, []);

  const fetchDaily = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/daily");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Curating Today's Playbills...
        </span>
      </div>
    );
  }

  if (!content) return null;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Dynamic Date Banner */}
      <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <Calendar className="w-4.5 h-4.5 text-brand-purple" />
        <span className="text-xs font-black text-white">{content.date} Edition</span>
        <Sparkles className="w-3.5 h-3.5 text-brand-blue/70 animate-pulse ml-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Col: Movie Spotlight & Hidden Gem */}
        <div className="md:col-span-2 space-y-6">
          {/* Spotlight film card */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-xl space-y-4 relative overflow-hidden flex flex-col sm:flex-row gap-5"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/5 to-transparent -z-10" />

            {content.todaysMovie.posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w185${content.todaysMovie.posterPath}`}
                alt={content.todaysMovie.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl bg-slate-950 shadow shrink-0 self-start"
              />
            )}

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple tracking-widest uppercase">
                  Movie Spotlight
                </span>
                <h3 className="text-base font-extrabold text-white leading-tight truncate">
                  {content.todaysMovie.title} ({content.todaysMovie.year})
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold italic">"{content.todaysMovie.tagline}"</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{content.todaysMovie.whyToday}</p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Spotlight Trivia</span>
                <p className="text-[10px] text-slate-300 leading-relaxed italic">"{content.todaysMovie.funFact}"</p>
              </div>

              {content.todaysMovie.tmdbId && (
                <Link
                  href={`/dashboard/movies/${content.todaysMovie.tmdbId}`}
                  className="inline-flex py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/5 hover:border-white/10 transition mt-2"
                >
                  Details Page
                </Link>
              )}
            </div>
          </motion.div>

          {/* Hidden gem card */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-3xl bg-slate-900/60 border border-white/5 shadow-xl space-y-4 flex flex-col sm:flex-row gap-5"
          >
            {content.hiddenGem.posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w185${content.hiddenGem.posterPath}`}
                alt={content.hiddenGem.title}
                className="w-24 sm:w-28 aspect-[2/3] object-cover rounded-xl bg-slate-950 shadow shrink-0 self-start"
              />
            )}

            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-blue tracking-widest uppercase">
                  Hidden Gem
                </span>
                <h3 className="text-base font-extrabold text-white leading-tight truncate">
                  {content.hiddenGem.title} ({content.hiddenGem.year})
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold italic">"{content.hiddenGem.tagline}"</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{content.hiddenGem.whyToday}</p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Gem Trivia</span>
                <p className="text-[10px] text-slate-300 leading-relaxed italic">"{content.hiddenGem.funFact}"</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Col: Director spotlight, challenge, quote, discussion */}
        <div className="space-y-6">
          {/* Director spotlight */}
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3"
          >
            <span className="text-[9px] font-bold text-brand-purple tracking-widest uppercase block">
              Director Focus
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">{content.todaysDirector.name}</h4>
              <span className="text-[10px] text-slate-500 font-semibold block">
                {content.todaysDirector.nationality} director • Notable: {content.todaysDirector.notableWork}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{content.todaysDirector.whyToday}</p>

            {content.todaysDirector.quote && (
              <div className="pt-2 flex gap-1.5 items-start">
                <Quote className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 italic leading-normal">
                  "{content.todaysDirector.quote}"
                </p>
              </div>
            )}
          </motion.div>

          {/* Daily Quote card */}
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 opacity-10">
              <Quote className="w-16 h-16 text-brand-blue" />
            </div>

            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-3">
              Dialogue of the Day
            </span>

            <blockquote className="space-y-2">
              <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                "{content.quote.quote}"
              </p>
              <footer className="text-[10px] text-slate-400 font-bold">
                — {content.quote.character ? `${content.quote.character}, ` : ""}{content.quote.movie} ({content.quote.year})
              </footer>
            </blockquote>
          </motion.div>

          {/* Watcher challenge */}
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-blue/5 border border-brand-purple/20 space-y-3"
          >
            <span className="text-[9px] font-bold text-brand-purple tracking-widest uppercase flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-brand-purple" /> Watcher Challenge
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white">{content.challenge.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {content.challenge.description}
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-400">
              Reward: {content.challenge.reward} • Examples: {content.challenge.exampleMovies.join(", ")}
            </div>
          </motion.div>

          {/* Discussion card */}
          <motion.div
            variants={itemVariants}
            className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3"
          >
            <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Seminar Debate
            </span>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200 leading-snug">{content.discussion.question}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{content.discussion.context}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
