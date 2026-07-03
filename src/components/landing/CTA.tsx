"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Film, Play } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-28 relative z-10 overflow-hidden">
      {/* Background glow blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-purple/15 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="rounded-3xl bg-gradient-to-tr from-slate-900 via-brand-dark to-slate-900 border border-white/10 p-12 md:p-16 relative overflow-hidden shadow-2xl space-y-8"
        >
          {/* Subtle line layout overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

          {/* Logo representation */}
          <div className="inline-flex p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white relative z-10">
            <Film className="w-6 h-6 text-brand-purple" />
          </div>

          <div className="space-y-4 max-w-2xl mx-auto relative z-10">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              Ready to Join the World's Biggest Movie Community?
            </h2>
            <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed max-w-md mx-auto">
              Create your account in seconds, log your first reviews, and connect with fellow cinephiles today.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/sign-up"
              className="w-full sm:w-auto relative group flex items-center justify-center space-x-2 px-8 py-4 rounded-xl overflow-hidden font-semibold text-white transition active:scale-95 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple group-hover:scale-105 transition-transform duration-300" />
              <span className="relative z-10 text-sm">Join CineVerse Now</span>
            </Link>

            <Link
              href="/dashboard/discover"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-sm font-semibold text-white transition active:scale-95 hover:bg-white/10"
            >
              <span>Explore The Catalog</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
