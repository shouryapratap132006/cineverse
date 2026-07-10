"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
}

export default function StreamingText({ text, speed = 8, className, onComplete }: StreamingTextProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (onCompleteRef.current) {
      const timer = setTimeout(() => onCompleteRef.current?.(), text.length * speed + 100);
      return () => clearTimeout(timer);
    }
  }, [text, speed]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {text}
      <motion.span
        className="inline-block w-0.5 h-4 bg-brand-purple ml-0.5 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.7 }}
      />
    </motion.span>
  );
}
