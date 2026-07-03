"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CATEGORIES_WITH_COLLAGES } from "@/lib/mockData";
import { Compass } from "lucide-react";

export default function MovieCategories() {
  const router = useRouter();

  const handleCategoryClick = (categoryName: string) => {
    // Navigate directly to discover with preset filter query
    router.push(`/dashboard/discover?genre=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="categories" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white">
              Explore By{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                Genre.
              </span>
            </h2>
            <p className="text-slate-400 font-light max-w-xl leading-relaxed">
              Diving deep into specific cinema realms. Select a genre below to immediately view top-rated catalog listings.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/discover")}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-sm font-semibold text-white transition self-start md:self-auto cursor-pointer"
          >
            <Compass className="w-4 h-4 text-brand-purple" />
            <span>Discover All Genres</span>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {CATEGORIES_WITH_COLLAGES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => handleCategoryClick(cat.name)}
              className="group aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-900 relative shadow-lg cursor-pointer"
            >
              {/* Category poster backdrop */}
              <img
                src={cat.poster}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 transition-opacity group-hover:opacity-90 duration-300" />
              
              {/* Glowing hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/0 via-brand-purple/20 to-brand-purple/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Title & Info */}
              <div className="absolute bottom-5 left-5 right-5 space-y-1">
                <h3 className="font-display font-extrabold text-lg text-white group-hover:text-brand-blue transition duration-200">
                  {cat.name}
                </h3>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider group-hover:text-white transition duration-200">
                  View Catalog
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
