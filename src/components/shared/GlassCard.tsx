"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  animateIn?: boolean;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  hoverGlow = true,
  animateIn = false,
  delay = 0,
  ...props
}: GlassCardProps) {
  const CardComponent = motion.div;

  const animationProps = animateIn
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-50px" },
        transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] as any },
      }
    : {};

  const hoverProps = hoverGlow
    ? {
        whileHover: { 
          y: -5,
          borderColor: "rgba(124, 58, 237, 0.3)",
          boxShadow: "0 20px 40px -15px rgba(124, 58, 237, 0.25), 0 10px 20px -15px rgba(37, 99, 235, 0.15)",
          backgroundColor: "rgba(15, 23, 42, 0.6)"
        },
        transition: { duration: 0.3, ease: "easeOut" as any }
      }
    : {};

  return (
    <CardComponent
      {...animationProps}
      {...hoverProps}
      className={cn(
        "glass-panel rounded-2xl p-6 border border-white/8 backdrop-blur-xl relative overflow-hidden transition-colors duration-300",
        className
      )}
      {...props}
    >
      {/* Dynamic light reflect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/2 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </CardComponent>
  );
}
