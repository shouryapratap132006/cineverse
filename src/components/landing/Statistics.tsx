"use client";

import React from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: "100K+", label: "Movies Cataloged", description: "Real-time sync with global titles", gradient: "from-blue-400 to-indigo-500" },
  { value: "2M+", label: "Cinephile Reviews", description: "Granular half-star scored reviews", gradient: "from-indigo-400 to-purple-500" },
  { value: "500K+", label: "Discussion Threads", description: "Deep dive film theories & logs", gradient: "from-purple-400 to-pink-500" },
  { value: "50K+", label: "Daily Messages", description: "Active movie club check-ins", gradient: "from-pink-400 to-rose-500" },
];

export default function Statistics() {
  return (
    <section className="py-24 relative z-10 bg-slate-950/10 overflow-hidden">
      {/* Background glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="text-center space-y-2.5 relative group"
            >
              {/* Massive Glowing Number */}
              <h3 className={`font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r ${stat.gradient} tracking-tight group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </h3>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {stat.label}
                </h4>
                <p className="text-[11px] text-slate-500 font-light leading-normal max-w-[160px] mx-auto">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
