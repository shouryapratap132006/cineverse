"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "@/lib/mockData";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-24 relative z-10 overflow-hidden bg-slate-950/10 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative flex flex-col items-center">
        
        {/* Quote Icon */}
        <div className="p-4 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-8">
          <Quote className="w-6 h-6 fill-brand-purple text-brand-purple" />
        </div>

        {/* Carousel Window */}
        <div className="w-full relative min-h-[280px] md:min-h-[220px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              className="w-full text-center"
            >
              <GlassCard hoverGlow={false} className="p-8 md:p-10 border-white/10 relative shadow-2xl">
                <div className="space-y-6">
                  {/* Quote content */}
                  <p className="text-base md:text-xl text-slate-200 leading-relaxed font-light italic">
                    "{current.quote}"
                  </p>

                  {/* Profile info */}
                  <div className="flex items-center justify-center space-x-3.5 pt-2">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-purple"
                    />
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-white">{current.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{current.role}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6 mt-8">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          
          {/* Indicators */}
          <div className="flex items-center space-x-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-brand-purple" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
