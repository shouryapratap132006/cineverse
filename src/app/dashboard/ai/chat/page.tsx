"use client";

import React from "react";
import ChatInterface from "@/components/ai/ChatInterface";

export default function AIChatPage() {
  return (
    <div className="w-full h-[calc(100vh-64px)] lg:h-screen">
      <ChatInterface />
    </div>
  );
}
