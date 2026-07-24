"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Repeat, Bookmark, MoreHorizontal, Smile, Send, Sparkles, Check } from "lucide-react";
import { toggleReaction, toggleBookmark, voteOnPoll, createComment } from "@/actions/social";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCineverseAuth } from "@/components/provider";

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
  const { user } = useCineverseAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    await createComment({ postId: post.id, content: commentText.trim() });
    setCommentText("");
    if (onUpdate) onUpdate();
    setSubmittingComment(false);
  };

  const handlePollVote = async (pollId: string, optionIndex: number) => {
    await voteOnPoll(pollId, optionIndex);
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
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-500 hover:text-white transition"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/dashboard/post/${post.id}`);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                Copy Link
              </button>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
              >
                Share via...
              </button>
              <div className="h-px bg-white/10 my-1"></div>
              <button 
                onClick={() => setShowMenu(false)}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition"
              >
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.imageUrl && (
          <img src={post.imageUrl} alt="Post attachment" className="mt-3 rounded-xl border border-white/10 max-h-96 object-cover w-full" />
        )}
        {post.movie && (
          <div className="mt-3 rounded-xl border border-white/5 bg-slate-800/50 p-3">
            <div className="flex items-center space-x-3">
              <div className="h-18 w-12 shrink-0 overflow-hidden rounded-md bg-slate-700">
                <img src={`/api/tmdb/img?path=/t/p/w200${post.movie.posterPath}`} alt={post.movie.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="mb-1 text-xs font-semibold text-brand-purple">Attached Movie</span>
                <span className="text-sm font-bold text-white">{post.movie.title}</span>
              </div>
            </div>
          </div>
        )}
        {post.poll && (() => {
          const votes = post.poll.votes || [];
          const totalVotes = votes.length;
          const userVote = user ? votes.find((v: any) => v.userId === user.id) : null;
          const hasVoted = !!userVote;

          return (
            <div className="mt-3 rounded-xl border border-white/10 bg-slate-800/40 p-4">
              <p className="text-sm font-semibold text-white mb-3">{post.poll.question}</p>
              <div className="space-y-2">
                {post.poll.options.map((option: string, index: number) => {
                  const optionVotes = votes.filter((v: any) => v.optionIndex === index).length;
                  const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                  const isSelected = userVote?.optionIndex === index;

                  return (
                    <button
                      key={`${post.poll.id}-${index}`}
                      type="button"
                      onClick={() => handlePollVote(post.poll.id, index)}
                      className={cn(
                        "relative overflow-hidden flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition text-left group",
                        isSelected
                          ? "border-brand-purple/60 text-white font-medium bg-slate-900/90"
                          : "border-white/10 text-slate-200 hover:border-white/25 bg-slate-900/70"
                      )}
                    >
                      {/* Background Percentage Fill */}
                      {(hasVoted || totalVotes > 0) && (
                        <div
                          className={cn(
                            "absolute left-0 top-0 bottom-0 transition-all duration-500 rounded-xl",
                            isSelected ? "bg-brand-purple/35" : "bg-white/10"
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2 font-medium">
                        {isSelected && <Check className="w-4 h-4 text-brand-purple shrink-0" />}
                        {option}
                      </span>
                      {(hasVoted || totalVotes > 0) ? (
                        <span className="relative z-10 text-xs font-bold text-slate-300 ml-2">
                          {percentage}%
                        </span>
                      ) : (
                        <span className="relative z-10 text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white bg-white/5 px-2 py-0.5 rounded-md transition">
                          Vote
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
                {hasVoted && <span className="text-brand-purple font-semibold">Voted</span>}
              </div>
            </div>
          );
        })()}
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

        <button onClick={() => setShowComments((prev) => !prev)} className="flex items-center space-x-2 text-slate-400 hover:text-brand-blue text-xs font-semibold transition group">
          <MessageSquare className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          <span>{post._count.comments || 0}</span>
        </button>

        <button className="flex items-center space-x-2 text-slate-400 hover:text-green-400 text-xs font-semibold transition group">
          <Repeat className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          <span>Share</span>
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

      {showComments && (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment"
              className="flex-1 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none"
            />
            <button type="submit" disabled={submittingComment} className="rounded-full bg-brand-purple p-2 text-white">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3">
              <p className="font-semibold text-white">Community-style interactions are enabled</p>
              <p className="mt-1 text-xs">You can now react, comment, share, and attach richer media to posts.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
