"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQS } from "@/lib/mockData";
import { HelpCircle, ChevronDown } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Questions.
            </span>
          </h2>
          <p className="text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Everything you need to know about the CineVerse platform, movie clubs, and recommendations.
          </p>
        </div>

        {/* FAQ Accordion Grid */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <GlassCard
                key={index}
                hoverGlow={false}
                className={`p-0 border-white/5 overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-brand-purple/30 bg-slate-950/40" : "bg-white/3"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between space-x-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center space-x-3.5">
                    <HelpCircle className={`w-5 h-5 transition-colors duration-300 ${isOpen ? "text-brand-purple" : "text-slate-500"}`} />
                    <span className="text-xs md:text-sm font-bold text-slate-200 transition-colors duration-200 hover:text-white">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-slate-500"
                  >
                    <ChevronDown className="w-4.5 h-4.5" />
                  </motion.div>
                </button>

                {/* Accordion Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-slate-400 font-light leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
