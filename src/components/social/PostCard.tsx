"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Repeat, Bookmark, MoreHorizontal, Smile } from "lucide-react";
import { toggleReaction, toggleBookmark } from "@/actions/social";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: any;
  onUpdate?: () => void;
}

const REACTIONS = [
  { emoji: "❤️", label: "LIKE" },
  { emoji: "🔥", label: "FIRE" },
  { emoji: "🎬", label: "CINE" },
  { emoji: "😂", label: "FUNNY" },
  { emoji: "😮", label: "WOW" },
  { emoji: "😭", label: "EMOTIONAL" },
  { emoji: "👏", label: "CLAP" },
];

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const currentUserReaction = post.reactions && post.reactions.length > 0 ? post.reactions[0] : null;
  const isBookmarked = post.bookmarks && post.bookmarks.length > 0;

  const handleReaction = async (emojiType: string) => {
    if (isLiking) return;
    setIsLiking(true);
    setShowReactions(false);
    await toggleReaction(post.id, "POST", emojiType);
    if (onUpdate) onUpdate();
    setIsLiking(false);
  };

  const handleBookmark = async () => {
    await toggleBookmark(post.id, "POST");
    if (onUpdate) onUpdate();
  };

  const activeReactionConfig = currentUserReaction 
    ? REACTIONS.find(r => r.label === currentUserReaction.emoji) 
    : null;

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 mb-4 hover:bg-slate-900/80 transition duration-300">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/dashboard/profile/${post.user.id}`} className="flex items-center space-x-3 group">
          <img 
            src={post.user.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
            alt="avatar" 
            className="w-10 h-10 rounded-full object-cover border border-white/10 group-hover:border-brand-purple transition"
          />
          <div>
            <h4 className="font-bold text-white text-sm group-hover:text-brand-blue transition">
              {post.user.profile?.username || "Unknown"}
            </h4>
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>
        <button className="text-slate-500 hover:text-white transition">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-xl border border-white/10 max-h-96 object-cover w-full" />
        )}
        {post.movie && (
          <div className="mt-3 bg-slate-800/50 rounded-xl p-3 flex space-x-3 border border-white/5">
            <div className="w-12 h-18 bg-slate-700 rounded-md overflow-hidden flex-shrink-0">
               <img src={`https://image.tmdb.org/t/p/w200${post.movie.posterPath}`} alt={post.movie.title} className="w-full h-full object-cover"/>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold text-brand-purple mb-1">Attached Movie</span>
              <span className="text-white font-bold text-sm">{post.movie.title}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-6 border-t border-white/5 pt-3 relative">
        <div className="relative">
          <button 
            onMouseEnter={() => setShowReactions(true)}
            onClick={() => handleReaction(activeReactionConfig ? activeReactionConfig.label : "LIKE")}
            className={cn(
              "flex items-center space-x-2 text-xs font-semibold transition group",
              activeReactionConfig ? "text-pink-500" : "text-slate-400 hover:text-white"
            )}
          >
            {activeReactionConfig ? (
              <span className="text-base group-hover:scale-125 transition-transform">{activeReactionConfig.emoji}</span>
            ) : (
              <Heart className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            )}
            <span>{post._count.reactions || 0}</span>
          </button>

          {/* Reactions Tooltip */}
          {showReactions && (
            <div 
              onMouseLeave={() => setShowReactions(false)}
              className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/10 rounded-full px-3 py-2 flex space-x-2 shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => handleReaction(r.label)}
                  className="text-xl hover:scale-150 transition-transform px-1 origin-bottom"
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center space-x-2 text-slate-400 hover:text-brand-blue text-xs font-semibold transition group">
          <MessageSquare className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          <span>{post._count.comments || 0}</span>
        </button>

        <button className="flex items-center space-x-2 text-slate-400 hover:text-green-400 text-xs font-semibold transition group">
          <Repeat className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="flex-1" />

        <button 
          onClick={handleBookmark}
          className={cn(
            "transition group",
            isBookmarked ? "text-brand-gold" : "text-slate-400 hover:text-white"
          )}
        >
          <Bookmark className={cn("w-4.5 h-4.5 group-hover:scale-110 transition-transform", isBookmarked && "fill-brand-gold")} />
        </button>
      </div>
    </div>
  );
}
