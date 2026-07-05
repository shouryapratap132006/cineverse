"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Heart, MessageSquare, Bookmark, Share2, MoreHorizontal,
  Film, Send, Flame, Smile, Eye, Star, AlertCircle
} from "lucide-react";
import { getPost, getComments, createComment, toggleReaction, toggleBookmark } from "@/actions/social";
import { useCineverseAuth } from "@/components/provider";
import GlassCard from "@/components/shared/GlassCard";
import { formatDistanceToNow } from "date-fns";

const REACTION_EMOJIS = [
  { emoji: "LIKE", icon: "❤️", label: "Like" },
  { emoji: "FIRE", icon: "🔥", label: "Fire" },
  { emoji: "CINE", icon: "🎬", label: "Cinematic" },
  { emoji: "WOW", icon: "😮", label: "Wow" },
  { emoji: "FUNNY", icon: "😂", label: "Funny" },
  { emoji: "EMOTIONAL", icon: "😢", label: "Emotional" },
];

export default function PostDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useCineverseAuth();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    getPost(id).then(res => {
      if (res.success && res.post) {
        setPost(res.post);
        setBookmarked((res.post as any).bookmarks?.length > 0);
      }
      setLoadingPost(false);
    });

    getComments(id, "POST").then(res => {
      if (res.success && res.comments) setComments(res.comments);
      setLoadingComments(false);
    });
  }, [id]);

  const handleReaction = async (emoji: string) => {
    if (!user) return;
    setShowReactions(false);
    await toggleReaction(id, "POST", emoji);
    // Re-fetch post
    const res = await getPost(id);
    if (res.success && res.post) setPost(res.post);
  };

  const handleBookmark = async () => {
    await toggleBookmark(id, "POST");
    setBookmarked(prev => !prev);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);

    const res = await createComment({
      postId: id,
      parentId: replyTo?.id,
      content: newComment
    });

    if (res.success) {
      setNewComment("");
      setReplyTo(null);
      // Refresh comments
      const fresh = await getComments(id, "POST");
      if (fresh.success && fresh.comments) setComments(fresh.comments);
    }
    setSubmittingComment(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: post?.content?.slice(0, 50) });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-16 h-16 text-slate-600" />
        <p className="text-white font-bold text-xl">Post not found</p>
        <Link href="/dashboard" className="text-brand-purple hover:underline text-sm">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const profile = post.user?.profile || {};
  const reactionCounts: Record<string, number> = {};
  (post.reactions || []).forEach((r: any) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
  });
  const totalReactions = post._count?.reactions || 0;
  const userReaction = post.reactions?.find((r: any) => r.userId === user?.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* Post Card */}
      <GlassCard hoverGlow={false} className="p-6 border-white/10 bg-slate-900/70 backdrop-blur-xl mb-6">

        {/* Author Header */}
        <div className="flex items-start justify-between mb-5">
          <Link href={`/dashboard/profile/${post.user?.id}`} className="flex items-center gap-3 group">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user?.id}`}
              alt={profile.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-brand-purple/60 transition"
            />
            <div>
              <p className="font-bold text-white group-hover:text-brand-purple transition">{profile.username || "Unknown"}</p>
              <p className="text-xs text-slate-500">
                {profile.reputation && <span className="text-brand-purple font-semibold mr-2">{profile.reputation}</span>}
                {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Link>
          <button className="p-2 text-slate-500 hover:text-white transition rounded-lg hover:bg-white/5">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <div className="mb-5">
          {post.spoilerTag && (
            <div className="mb-3 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" />
              Contains Spoilers
            </div>
          )}

          <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">{post.content}</p>

          {post.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
              <img src={post.imageUrl} alt="Post image" className="w-full max-h-96 object-cover" />
            </div>
          )}

          {/* Tagged Movie */}
          {post.movie && (
            <Link href={`/dashboard/movies/${post.movie.id}`} className="mt-4 flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-brand-blue/40 transition group">
              {post.movie.posterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${post.movie.posterPath}`}
                  alt={post.movie.title}
                  className="w-10 h-14 object-cover rounded-lg border border-white/10"
                />
              )}
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-0.5">
                  <Film className="w-3 h-3" />
                  Tagged Movie
                </div>
                <p className="text-sm font-bold text-white group-hover:text-brand-blue transition">{post.movie.title}</p>
              </div>
            </Link>
          )}

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.hashtags.map((tag: string) => (
                <span key={tag} className="text-xs font-semibold text-brand-blue hover:text-blue-300 cursor-pointer transition">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-white/5 pt-4 mb-4">
          <span>{totalReactions} reactions</span>
          <span>{post._count?.comments || 0} comments</span>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1">

          {/* Reaction Button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition hover:bg-white/5 ${userReaction ? "text-red-400" : "text-slate-400 hover:text-white"}`}
            >
              <span className="text-base">{userReaction ? REACTION_EMOJIS.find(r => r.emoji === userReaction.emoji)?.icon || "❤️" : "🤍"}</span>
              <span>{userReaction ? userReaction.emoji.charAt(0) + userReaction.emoji.slice(1).toLowerCase() : "React"}</span>
            </button>

            {showReactions && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-150">
                {REACTION_EMOJIS.map(r => (
                  <button
                    key={r.emoji}
                    onClick={() => handleReaction(r.emoji)}
                    title={r.label}
                    className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-white/5"
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => document.getElementById("comment-input")?.focus()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition hover:bg-white/5 ${bookmarked ? "text-brand-purple" : "text-slate-400 hover:text-white"}`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-brand-purple" : ""}`} />
            <span>{bookmarked ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Reaction breakdown */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 border-t border-white/5 pt-3">
            {Object.entries(reactionCounts).map(([emoji, count]) => {
              const r = REACTION_EMOJIS.find(re => re.emoji === emoji);
              return (
                <span key={emoji} className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">
                  <span>{r?.icon}</span>
                  <span>{count}</span>
                </span>
              );
            })}
          </div>
        )}

      </GlassCard>

      {/* Comment Input */}
      <GlassCard hoverGlow={false} className="p-4 border-white/10 bg-slate-900/70 mb-6">
        {replyTo && (
          <div className="flex items-center justify-between mb-3 px-3 py-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg">
            <span className="text-xs text-brand-blue font-semibold">Replying to @{replyTo.username}</span>
            <button onClick={() => setReplyTo(null)} className="text-xs text-slate-400 hover:text-white ml-4">✕</button>
          </div>
        )}
        <form onSubmit={handleComment} className="flex items-end gap-3">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            alt="You"
            className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
          />
          <div className="flex-1 bg-slate-950 border border-white/10 rounded-xl focus-within:border-brand-purple/50 transition">
            <textarea
              id="comment-input"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Write a comment..."}
              rows={2}
              className="w-full bg-transparent text-sm text-white px-4 pt-3 pb-2 resize-none outline-none placeholder-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || submittingComment}
            className="p-3 bg-brand-purple hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl transition shrink-0"
          >
            {submittingComment ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </GlassCard>

      {/* Comments Section */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {post._count?.comments || 0} Comments
        </h3>

        {loadingComments ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p>No comments yet. Be the first to say something.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onReply={(cid, uname) => {
                setReplyTo({ id: cid, username: uname });
                document.getElementById("comment-input")?.focus();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUserId, onReply, depth = 0 }: {
  comment: any;
  currentUserId?: string;
  onReply: (id: string, username: string) => void;
  depth?: number;
}) {
  const profile = comment.user?.profile || {};
  const isOwnComment = comment.userId === currentUserId;

  const handleReact = async () => {
    await toggleReaction(comment.id, "COMMENT", "LIKE");
  };

  return (
    <div className={`${depth > 0 ? "ml-10 mt-2" : "mb-4"}`}>
      <div className="flex gap-3">
        <Link href={`/dashboard/profile/${comment.user?.id}`} className="shrink-0">
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id}`}
            alt={profile.username}
            className="w-8 h-8 rounded-full object-cover border border-white/10 hover:border-brand-purple/60 transition"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-900/80 border border-white/5 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/dashboard/profile/${comment.user?.id}`} className="text-xs font-bold text-white hover:text-brand-purple transition">
                {profile.username || "Unknown"}
              </Link>
              {profile.reputation && (
                <span className="text-[9px] font-bold text-brand-purple/80">{profile.reputation}</span>
              )}
              <span className="text-[10px] text-slate-500 ml-auto">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-3 mt-1.5 px-2">
            <button
              onClick={handleReact}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-red-400 transition"
            >
              <Heart className="w-3 h-3" />
              {comment._count?.reactions > 0 && <span>{comment._count.reactions}</span>}
              <span>Like</span>
            </button>
            <button
              onClick={() => onReply(comment.id, profile.username)}
              className="text-[10px] font-bold text-slate-500 hover:text-brand-blue transition"
            >
              Reply
            </button>
            {comment._count?.replies > 0 && (
              <span className="text-[10px] text-slate-600">{comment._count.replies} replies</span>
            )}
          </div>

          {/* Nested Replies */}
          {comment.replies?.map((reply: any) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
