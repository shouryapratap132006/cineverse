"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Sparkles, Play, Compass, Star, TrendingUp, Users, Heart } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const floatingPosters = [
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200",
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200",
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200"
];

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as any },
    },
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Cinematic Gradient Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-brand-blue/15 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/15 blur-[130px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Floating Background Posters */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none hidden xl:block">
        {floatingPosters.map((url, i) => (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            style={{
              width: "140px",
              height: "210px",
              top: `${15 + i * 20}%`,
              left: i % 2 === 0 ? `${5 + i * 3}%` : "auto",
              right: i % 2 !== 0 ? `${5 + i * 3}%` : "auto",
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [i % 2 === 0 ? -3 : 3, i % 2 === 0 ? -1 : 1, i % 2 === 0 ? -3 : 3]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img src={url} alt="cinema poster" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* Left Side: Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-brand-blue font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>Discover CineVerse 2.0</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={itemVariants} className="font-display font-extrabold text-5xl md:text-6xl lg:text-[70px] leading-[1.05] tracking-tight text-white">
            Discover Movies. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Find Your People.
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-light">
            More than a movie database. Join millions of cinephiles discovering films, building friendships, sharing reviews, and exploring cinema with AI.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto relative group flex items-center justify-center space-x-2 px-8 py-4 rounded-xl overflow-hidden font-semibold text-white transition duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple group-hover:scale-105 transition-transform duration-300" />
              <Play className="w-4.5 h-4.5 relative z-10 fill-white" />
              <span className="relative z-10">Get Started</span>
            </Link>

            <Link
              href="/dashboard/discover"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl glass-panel hover:bg-white/10 border border-white/10 hover:border-white/20 font-semibold text-white transition-all duration-300"
            >
              <Compass className="w-4.5 h-4.5 text-brand-blue" />
              <span>Explore Movies</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Side: 3D Mockup Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="lg:col-span-6 relative w-full aspect-square md:aspect-[4/3] lg:aspect-square flex items-center justify-center"
        >
          {/* Main Dashboard Canvas backdrop */}
          <div className="w-[85%] h-[85%] rounded-3xl bg-slate-950/40 border border-white/5 backdrop-blur-2xl relative shadow-2xl overflow-hidden">
            {/* Top Bar Mock */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-slate-950/20">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="w-1/3 h-4 bg-white/5 rounded-md" />
              <div className="w-5 h-5 rounded-full bg-white/10" />
            </div>

            {/* Dashboard grid visual lines */}
            <div className="p-4 grid grid-cols-12 gap-4 h-full">
              <div className="col-span-3 border-r border-white/5 h-[80%] space-y-4 pt-2">
                <div className="w-[80%] h-3 bg-white/5 rounded" />
                <div className="w-[60%] h-3 bg-white/5 rounded" />
                <div className="w-[70%] h-3 bg-white/5 rounded" />
              </div>
              <div className="col-span-9 pt-2 space-y-4">
                <div className="h-20 bg-white/3 rounded-xl border border-white/5" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-white/3 rounded-xl border border-white/5" />
                  <div className="h-24 bg-white/3 rounded-xl border border-white/5" />
                </div>
              </div>
            </div>
          </div>

          {/* Drifting Floating Cards (Mockup details) */}

          {/* Card 1: Trending Movie */}
          <motion.div
            className="absolute top-[8%] left-[2%] z-20 w-[220px]"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <GlassCard hoverGlow={false} className="p-4 rounded-xl border-white/10">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=100"
                  alt="Dune"
                  className="w-12 h-16 object-cover rounded-lg"
                />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white truncate">Dune: Part Two</h4>
                  <div className="flex items-center text-brand-gold text-[10px] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold mr-1" />
                    <span>8.9 / 10</span>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-0.5">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] text-slate-400 font-medium">#1 Trending</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 2: AI Recommendations */}
          <motion.div
            className="absolute bottom-[5%] right-[2%] z-20 w-[260px]"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <GlassCard hoverGlow={false} className="p-4 rounded-xl border-white/10">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1 w-full">
                  <h4 className="text-xs font-bold text-white">AI CineCompanion</h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Based on your interest in <span className="text-brand-purple font-medium">Interstellar</span>, you might enjoy <span className="text-brand-blue font-medium">Arrival</span>.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/5 border border-white/10 text-slate-300">Sci-Fi</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/5 border border-white/10 text-slate-300">Atmospheric</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 3: Friends Activity */}
          <motion.div
            className="absolute top-[48%] -left-[10%] z-30 w-[240px]"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <GlassCard hoverGlow={false} className="p-3.5 rounded-xl border-white/10">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                  alt="Friend"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="space-y-0.5 text-left w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">Clara</span>
                    <span className="text-[9px] text-slate-500">Just reviewed</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-semibold text-brand-purple">Parasite</p>
                  <div className="flex text-brand-gold">
                    <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                    <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                    <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                    <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                    <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Card 4: Watchlist Preview & Stats */}
          <motion.div
            className="absolute top-[18%] -right-[6%] z-20 w-[190px]"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <GlassCard hoverGlow={false} className="p-4 rounded-xl border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-slate-200">
                    <Users className="w-3.5 h-3.5 text-brand-blue" />
                    <span className="text-[11px] font-bold">Watchlist</span>
                  </div>
                  <span className="text-[10px] text-brand-blue font-semibold">12 Films</span>
                </div>
                
                {/* Watchlist tiny avatars overlay */}
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" alt="" />
                  <img className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="" />
                  <img className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-slate-950 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50" alt="" />
                  <div className="h-6.5 w-6.5 rounded-full bg-slate-800 ring-2 ring-slate-950 flex items-center justify-center text-[9px] font-bold text-slate-400">
                    +9
                  </div>
                </div>

                <div className="w-full bg-white/5 rounded-full h-1">
                  <div className="bg-brand-blue h-1 rounded-full w-[65%]" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
