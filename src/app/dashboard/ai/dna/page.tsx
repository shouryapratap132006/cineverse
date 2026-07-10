"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import MovieDNACard from "@/components/ai/MovieDNACard";

export default function MovieDNAPage() {
  const [dnaData, setDnaData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDNA();
  }, []);

  const fetchDNA = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/profile");
      if (res.ok) {
        const data = await res.json();
        setDnaData(data.dna);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-lg font-black text-white tracking-tight">Movie DNA</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            Analyzing Viewing Vectors...
          </span>
        </div>
      ) : (
        dnaData && <MovieDNACard dna={dnaData} />
      )}
    </div>
  );
}
