"use client";

import React, { useState } from "react";
import { useCineverseAuth } from "@/components/provider";
import { createPost } from "@/actions/social";
import { Image as ImageIcon, Film, BarChart2, Send, X } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

export default function Composer() {
  const { user } = useCineverseAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    const res = await createPost({ content });
    if (res.success) {
      setContent("");
      setIsFocused(false);
    } else {
      alert("Failed to post: " + res.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <GlassCard hoverGlow={false} className="p-4 sm:p-5 border-white/10 shadow-xl relative overflow-hidden">
      {isFocused && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 pointer-events-none transition-opacity duration-500" />
      )}
      
      <div className="flex gap-4 relative z-10">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-md">
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="flex-grow space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !content && setIsFocused(false)}
            placeholder="What's your cinematic take today?"
            className="w-full bg-transparent border-none text-white text-sm placeholder:text-slate-500 resize-none focus:ring-0 p-0 min-h-[60px]"
            rows={isFocused || content ? 3 : 1}
          />

          {(isFocused || content.length > 0) && (
            <div className="flex items-center justify-between pt-3 border-t border-white/5 animate-fadeIn">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="p-2 rounded-full hover:bg-white/5 text-brand-blue transition" title="Attach Image">
                  <ImageIcon className="w-4.5 h-4.5" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/5 text-brand-purple transition" title="Tag Movie">
                  <Film className="w-4.5 h-4.5" />
                </button>
                <button className="p-2 rounded-full hover:bg-white/5 text-brand-gold transition" title="Create Poll">
                  <BarChart2 className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`text-[10px] font-bold ${content.length > 280 ? "text-red-400" : "text-slate-500"}`}>
                  {content.length}/280
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting || content.length > 280}
                  className="px-5 py-2 rounded-full bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-bold transition shadow-lg shadow-brand-purple/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  {isSubmitting ? (
                    <span>Posting...</span>
                  ) : (
                    <>
                      <span>Post</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
