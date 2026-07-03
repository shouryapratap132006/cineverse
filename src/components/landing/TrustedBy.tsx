"use client";

import React from "react";

const STUDIOS = [
  "Netflix",
  "A24",
  "Warner Bros",
  "Disney",
  "Marvel Studios",
  "Studio Ghibli",
  "HBO",
  "Apple TV+",
  "Prime Video",
];

export default function TrustedBy() {
  return (
    <section className="py-12 border-y border-white/5 bg-slate-950/20 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500">
          Cinematic Inspiration & Support
        </p>
      </div>

      <div className="relative w-full flex items-center overflow-hidden py-2 select-none">
        {/* Left and Right Fade Shadows */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />

        {/* Infinite Scroll Container */}
        <div className="flex w-max animate-infinite-scroll space-x-16 items-center">
          {/* Double array to create seamless loop */}
          {[...STUDIOS, ...STUDIOS, ...STUDIOS].map((studio, index) => (
            <div
              key={index}
              className="text-lg md:text-xl font-display font-extrabold tracking-widest text-slate-500 hover:text-slate-300 transition duration-300 select-none cursor-default"
            >
              {studio}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
