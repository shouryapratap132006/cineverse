"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Repeat2, Share, MoreHorizontal } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { toggleLike, createComment } from "@/actions/social";
import { useCineverseAuth } from "@/components/provider";
import Link from "next/link";

export default function Feed({ initialPosts }: { initialPosts: any[] | undefined }) {
  const { user } = useCineverseAuth();
  const [posts, setPosts] = useState(initialPosts ?? []);

  const handleLike = async (postId: string, hasLiked: boolean) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: hasLiked ? p.likes.filter((l: any) => l.userId !== user.id) : [...p.likes, { userId: user.id }],
          _count: {
            ...p._count,
            likes: hasLiked ? p._count.likes - 1 : p._count.likes + 1
          }
        };
      }
      return p;
    }));

    await toggleLike(postId);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-white font-bold text-lg">No posts yet</h3>
        <p className="text-slate-400 text-sm">Be the first to share your cinematic thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const hasLiked = user && post.likes.some((l: any) => l.userId === user.id);
        const profile = post.user.profile;

        return (
          <GlassCard key={post.id} hoverGlow={false} className="p-5 border-white/10 shadow-lg">
            <div className="flex gap-4">
              {/* Avatar */}
              <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                  <img src={profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={profile?.username || "User"} className="w-full h-full object-cover" />
                </div>
              </Link>

              {/* Content */}
              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Link href={`/profile/${post.user.id}`} className="font-bold text-white text-sm hover:underline">
                      {profile?.username || "Cinephile"}
                    </Link>
                    {profile?.reputation && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                        {profile.reputation}
                      </span>
                    )}
                    <span className="text-slate-500 text-xs flex items-center before:content-['•'] before:mr-2">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <button className="text-slate-500 hover:text-white transition">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Optional Media (Images/GIFs/Movie Tags) */}
                {post.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-white/10 shadow-md max-h-80">
                    <img src={post.imageUrl} alt="post media" className="w-full h-full object-cover" />
                  </div>
                )}
                {post.movie && (
                  <div className="mt-3 p-3 rounded-xl border border-brand-blue/30 bg-brand-blue/5 flex items-center space-x-3 backdrop-blur-sm">
                    <div className="w-10 h-14 bg-slate-800 rounded-md overflow-hidden">
                      {post.movie.posterPath ? (
                        <img src={`https://image.tmdb.org/t/p/w200${post.movie.posterPath}`} alt={post.movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No Image</div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-blue">Tagged Movie</p>
                      <p className="text-white text-sm font-semibold">{post.movie.title}</p>
                    </div>
                  </div>
                )}

                {/* Interactions Row */}
                <div className="flex items-center justify-between pt-3 text-slate-400 max-w-sm">
                  <button className="flex items-center space-x-1.5 hover:text-brand-blue transition group">
                    <div className="p-1.5 rounded-full group-hover:bg-brand-blue/10">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{post._count.comments || 0}</span>
                  </button>

                  <button className="flex items-center space-x-1.5 hover:text-emerald-400 transition group">
                    <div className="p-1.5 rounded-full group-hover:bg-emerald-400/10">
                      <Repeat2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">0</span>
                  </button>

                  <button 
                    onClick={() => handleLike(post.id, hasLiked)}
                    className={`flex items-center space-x-1.5 transition group ${hasLiked ? 'text-brand-purple' : 'hover:text-brand-purple'}`}
                  >
                    <div className={`p-1.5 rounded-full ${hasLiked ? 'bg-brand-purple/10' : 'group-hover:bg-brand-purple/10'}`}>
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-brand-purple' : ''}`} />
                    </div>
                    <span className="text-xs font-semibold">{post._count.likes || 0}</span>
                  </button>

                  <button className="flex items-center space-x-1.5 hover:text-brand-gold transition group">
                    <div className="p-1.5 rounded-full group-hover:bg-brand-gold/10">
                      <Share className="w-4 h-4" />
                    </div>
                  </button>
                </div>

              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
