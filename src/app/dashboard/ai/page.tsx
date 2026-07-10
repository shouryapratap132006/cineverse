"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Bookmark,
  Calendar,
  BookOpen,
  User,
  Heart,
  MessageSquare,
  Compass,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/shared/GlassCard";

export default function AIHubPage() {
  const tools = [
    {
      title: "Semantic Search",
      desc: "Search movies by natural vibe, narrative style, or cinematography. No keywords required.",
      href: "/dashboard/ai/search",
      icon: Search,
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "Personalized Recommendations",
      desc: "Discover hidden gems, comfort watches, mind-benders, and personalized movie marathons.",
      href: "/dashboard/ai/recommend",
      icon: Compass,
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-400"
    },
    {
      title: "Movie DNA Analysis",
      desc: "Deconstruct your film taste profile. Discover your cinema personality and viewing statistics.",
      href: "/dashboard/ai/dna",
      icon: User,
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-400"
    },
    {
      title: "AI Watchlist Builder",
      desc: "Type a prompt for your mood and curate customized streaming playlists in seconds.",
      href: "/dashboard/ai/watchlist",
      icon: Bookmark,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400"
    },
    {
      title: "Seminar School",
      desc: "Deconstruct cinematic composition, screenplay beats, and color theories with Professor Cine.",
      href: "/dashboard/ai/professor",
      icon: BookOpen,
      color: "from-indigo-500/20 to-violet-500/10",
      iconColor: "text-indigo-400"
    },
    {
      title: "Daily Playbills",
      desc: "Spotlight films, challenges, dialogue quotes, and director focus topics curated daily.",
      href: "/dashboard/ai/daily",
      icon: Calendar,
      color: "from-rose-500/20 to-red-500/10",
      iconColor: "text-rose-400"
    },
    {
      title: "Intelligence Chatbot",
      desc: "Discuss cinema history, deconstruct directors, and store your chat discussions.",
      href: "/dashboard/ai/chat",
      icon: MessageSquare,
      color: "from-fuchsia-500/20 to-purple-500/10",
      iconColor: "text-fuchsia-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header Splash */}
      <div className="relative p-6 md:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-white/5 overflow-hidden flex flex-col justify-center min-h-[220px]">
        {/* Neon blur blobs */}
        <div className="absolute top-0 right-10 w-48 h-48 bg-brand-purple/15 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-brand-blue/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple animate-pulse" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Cineverse AI Layer
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            The Intelligence Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl leading-relaxed">
            Welcome to CineVerse's cognitive network. We've compiled film databases, director catalogs, color analyses, and recommendation graphs under a unified cognitive framework.
          </p>
        </div>
      </div>

      {/* Grid of Tools */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div key={tool.title} variants={cardVariants}>
              <Link href={tool.href} className="block h-full cursor-pointer">
                <GlassCard className="h-full hover:border-brand-purple/40 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between p-5 space-y-4">
                  {/* Backdrop glowing gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />

                  <div className="space-y-3">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit ${tool.iconColor}`}>
                      <Icon className="w-5 h-5 group-hover:scale-105 transition-transform" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white tracking-tight group-hover:text-brand-purple transition">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 group-hover:text-white transition pt-4">
                    <span>Activate Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
