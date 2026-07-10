"use client";

import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import WatchlistBuilder from "@/components/ai/WatchlistBuilder";

export default function WatchlistBuilderPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Header Navigation */}
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
          <h1 className="text-lg font-black text-white tracking-tight">AI Watchlist Builder</h1>
        </div>
      </div>

      <WatchlistBuilder />
    </div>
  );
}
