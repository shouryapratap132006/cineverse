"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Flame, Brain, Star, Bookmark, Heart, Globe } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Movie Companion",
    description: "Chat with an intelligence that understands cinematography, mood, scores, and obscure reference points.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: MessageSquare,
    title: "Community Discussions",
    description: "Deep dive into film analyses, fan theories, and heated director comparisons with moderated forums.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Flame,
    title: "Movie Clubs",
    description: "Join localized or topic-based clubs reading, watching, and discussing selected titles weekly.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    description: "Get hyper-personalized recommendations mapped directly to your past history, current mood, and streaming subscriptions.",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: Star,
    title: "Movie Reviews",
    description: "Publish detailed logs, score with half-star granularity, tag details, and interact with other critics.",
    color: "from-amber-400 to-yellow-500",
  },
  {
    icon: Bookmark,
    title: "Smart Watchlists",
    description: "Track movies you want to see, categorize by watched, favorite, or custom folders, and share with friends.",
    color: "from-teal-400 to-emerald-500",
  },
  {
    icon: Heart,
    title: "Friend Activity Feed",
    description: "Follow friends, view their current watch activity, comment on logs, and co-curate joint watchlists.",
    color: "from-red-400 to-rose-500",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Connect with movie lovers from over 150 countries. Expand your taste with global reviews and subtitles.",
    color: "from-cyan-400 to-blue-500",
  },
];

export default function WhyCineVerse() {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white">
            Designed For The Ultimate{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Cinephile.
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 font-light leading-relaxed">
            We combined the tracking of Letterboxd, the metadata of IMDb, the community of Discord, and a cutting-edge AI engine.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <GlassCard
                key={i}
                animateIn={true}
                delay={i * 0.05}
                className="group border-white/5 flex flex-col items-start text-left h-full"
              >
                {/* Icon Container */}
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${feature.color} opacity-90 text-white mb-6 group-hover:scale-110 transition duration-300 shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-brand-purple transition duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </GlassCard>
            );
          })}
        </div>

      </div>
    </section>
  );
}
