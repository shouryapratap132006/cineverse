"use client";

import React, { useEffect, useRef } from "react";
import { Picker } from "emoji-mart";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
  theme?: "light" | "dark" | "auto";
  set?: "native" | "apple" | "google" | "facebook";
  skinTonePosition?: "none" | "search" | "preview";
  previewPosition?: "none" | "top" | "bottom";
  searchPosition?: "none" | "sticky";
  navPosition?: "none" | "top" | "bottom";
  perLine?: number;
  maxFrequentRows?: number;
  style?: React.CSSProperties;
  data?: any;
}

export default function EmojiPicker(props: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useRef<any>(null);

  if (instance.current && typeof instance.current.update === "function") {
    instance.current.update(props);
  }

  useEffect(() => {
    if (!ref.current) return;

    instance.current = new Picker({
      ...props,
      data,
      ref: ref,
    });

    return () => {
      instance.current = null;
    };
  }, []);

  return <div ref={ref} />;
}
