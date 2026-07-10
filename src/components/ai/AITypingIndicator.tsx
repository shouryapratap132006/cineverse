"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AITypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [0, -6, 0] }
  };

  const dotTransition = (delay: number) => ({
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut" as any,
    delay
  });

  return (
    <div className="flex items-center space-x-1.5 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl w-fit backdrop-blur-md">
      <span className="text-[10px] font-semibold text-slate-400 mr-1 select-none">AI is analyzing</span>
      <div className="flex space-x-1">
        <motion.div
          className="w-1.5 h-1.5 bg-brand-blue rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={dotTransition(0)}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-brand-purple rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={dotTransition(0.15)}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-brand-purple rounded-full"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={dotTransition(0.3)}
        />
      </div>
    </div>
  );
}
