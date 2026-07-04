"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Film, BarChart2, EyeOff, Send } from "lucide-react";
import { createPost } from "@/actions/social";
import { useCineverseAuth } from "@/components/provider";
import { cn } from "@/lib/utils";

export default function PostComposer({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useCineverseAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spoiler, setSpoiler] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const res = await createPost({ content, spoilerTag: spoiler });
    if (res.success) {
      setContent("");
      setSpoiler(false);
      if (onPostCreated) onPostCreated();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 mb-6 shadow-lg backdrop-blur-md">
      <div className="flex items-start space-x-4">
        <img 
          src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
          alt="Avatar" 
          className="w-11 h-11 rounded-full object-cover border border-white/10"
        />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your cinematic thought today?"
            className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-base"
            rows={3}
          />
          <hr className="border-white/5" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              <button className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-full transition" title="Attach Image">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-full transition" title="Tag Movie">
                <Film className="w-5 h-5" />
              </button>
              <button className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-full transition" title="Create Poll">
                <BarChart2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSpoiler(!spoiler)}
                className={cn("p-2 rounded-full transition flex items-center space-x-1", spoiler ? "text-red-400 bg-red-400/10" : "text-slate-400 hover:bg-slate-800")}
                title="Spoiler Warning"
              >
                <EyeOff className="w-5 h-5" />
                {spoiler && <span className="text-[10px] font-bold uppercase">Spoiler</span>}
              </button>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-brand-purple hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-full text-sm flex items-center space-x-2 transition"
            >
              {isSubmitting ? <span>Posting...</span> : (
                <>
                  <span>Post</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
