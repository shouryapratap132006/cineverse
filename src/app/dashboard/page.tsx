"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTrendingMovies } from "@/hooks/useMovies";
import { useCineverseAuth } from "@/components/provider";
import { Sparkles, Play, Plus, Send, Heart, MessageSquare, Star, Film, Bookmark, Calendar } from "lucide-react";
import RightSidebar from "@/components/dashboard/RightSidebar";
import GlassCard from "@/components/shared/GlassCard";
import { MOCK_COMMUNITY_POSTS } from "@/lib/mockData";

export default function DashboardPage() {
  const { user } = useCineverseAuth();
  const { data: trendingMovies, isLoading } = useTrendingMovies();

  // Social feed states
  const [feedPosts, setFeedPosts] = useState(MOCK_COMMUNITY_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  // Quick AI Companion state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggested, setAiSuggested] = useState<any>(null);
  const [aiSearching, setAiSearching] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `post_${Date.now()}`,
      user: user?.username || "cinephile",
      userAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      userTitle: "Member",
      content: newPostContent,
      likes: 0,
      commentsCount: 0,
      timeAgo: "Just now"
    };

    setFeedPosts([newPost, ...feedPosts]);
    setNewPostContent("");
  };

  const handleLikePost = (id: string) => {
    setLikes((prev) => {
      const isLiked = !prev[id];
      setFeedPosts((posts) =>
        posts.map((p) => {
          if (p.id === id) {
            return { ...p, likes: isLiked ? p.likes + 1 : p.likes - 1 };
          }
          return p;
        })
      );
      return { ...prev, [id]: isLiked };
    });
  };

  const handleQuickAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiSearching(true);
    setAiSuggested(null);

    setTimeout(() => {
      // Return a simulated recommendation
      setAiSuggested({
        title: "Dune: Part Two",
        year: 2024,
        id: "2",
        reason: "Matches your query for scale, deep themes, and sci-fi grandeur. Superb visuals.",
        rating: 8.9
      });
      setAiSearching(false);
    }, 1500);
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Scrollable Center Feed */}
      <div className="flex-grow max-w-5xl px-6 md:px-12 py-8 space-y-8 xl:pr-[340px]">
        
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">{user?.username || "Cinephile"}</span>
          </h1>
          <p className="text-xs text-slate-400">Discover trending films, check your watchlists, and connect with your clubs.</p>
        </div>

        {/* Carousel: Trending Movies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-slate-200">Trending Cinema</h2>
            <Link href="/dashboard/discover" className="text-xs text-brand-blue hover:text-brand-purple font-semibold">
              Explore All
            </Link>
          </div>

          <div className="flex space-x-5 overflow-x-auto pb-4 no-scrollbar">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="w-[180px] flex-shrink-0 space-y-3 animate-pulse">
                  <div className="w-full aspect-[2/3] bg-slate-900 rounded-2xl border border-white/5" />
                  <div className="h-4 bg-slate-900 rounded w-3/4" />
                  <div className="h-3 bg-slate-900 rounded w-1/2" />
                </div>
              ))
            ) : (
              trendingMovies?.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/dashboard/movies/${movie.id}`}
                  className="w-[170px] flex-shrink-0 space-y-2 group block"
                >
                  <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/8 relative shadow-lg group-hover:border-brand-purple/40 transition duration-300">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10 flex items-center text-[9px] font-bold text-brand-gold">
                      <Star className="w-2.5 h-2.5 fill-brand-gold text-brand-gold mr-0.5" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition duration-200">
                    {movie.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {movie.releaseYear} • {movie.genres[0]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Two Column Layout: Feed / Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left: Feed & Post Maker (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Post Creator */}
            <GlassCard hoverGlow={false} className="p-4 border-white/10 bg-slate-950/40">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <img
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  <textarea
                    rows={2}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts on a recent film, request reviews, or update your clubs..."
                    className="w-full py-2.5 bg-transparent text-xs text-white placeholder-slate-500 outline-none resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-3.5">
                  <div className="flex space-x-2">
                    <button type="button" className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
                      <Film className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-2 bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer">
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Post Thread</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </GlassCard>

            {/* Posts Feed */}
            <div className="space-y-4">
              {feedPosts.map((post) => (
                <GlassCard
                  key={post.id}
                  hoverGlow={true}
                  className="p-5 border-white/5 hover:border-white/8 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={post.userAvatar}
                          alt={post.user}
                          className="w-9 h-9 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition duration-200">{post.user}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-purple/20 text-brand-purple border border-brand-purple/20 font-bold uppercase">
                              {post.userTitle}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">{post.timeAgo}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center space-x-6 border-t border-white/5 pt-3 mt-1.5">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer transition ${
                          likes[post.id] ? "text-red-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likes[post.id] ? "fill-red-400 text-red-400" : ""}`} />
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentsCount} Comments</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

          </div>

          {/* Right: Continue Watching / Quick AI Ask (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            
            {/* Continue Watching */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                <Play className="w-3.5 h-3.5 text-brand-blue fill-brand-blue" />
                <span>Continue watching</span>
              </h3>
              
              <GlassCard hoverGlow={true} className="p-4 border-white/5 hover:border-white/10">
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=100"
                    alt="Arrival"
                    className="w-10 h-14 object-cover rounded-lg border border-white/10"
                  />
                  <div className="space-y-1.5 w-full">
                    <h4 className="text-xs font-bold text-white leading-none">Arrival</h4>
                    <span className="text-[10px] text-slate-500 font-semibold block">48m left • Sci-Fi</span>
                    <div className="w-full bg-white/5 rounded-full h-1 mt-1">
                      <div className="bg-brand-blue h-1 rounded-full w-[70%]" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Quick AI Companion Widget */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                <span>Quick AI Recommendation</span>
              </h3>
              
              <GlassCard hoverGlow={false} className="p-4 border-white/8 bg-slate-950/40">
                <form onSubmit={handleQuickAiAsk} className="space-y-3">
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Tell AI what movie vibe you are seeking..."
                    className="w-full py-2.5 px-3 bg-white/3 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 outline-none resize-none focus:border-brand-purple/50 focus:bg-slate-950"
                  />
                  <button
                    type="submit"
                    disabled={aiSearching}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition flex items-center justify-center space-x-1.5"
                  >
                    {aiSearching ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Query Companion</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Return values */}
                {aiSuggested && (
                  <div className="mt-4 p-3 bg-white/3 border border-brand-purple/20 rounded-xl space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-white truncate">{aiSuggested.title}</h4>
                      <div className="flex items-center text-[10px] text-brand-gold font-semibold">
                        <Star className="w-3 h-3 fill-brand-gold text-brand-gold mr-0.5" />
                        <span>{aiSuggested.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-light">
                      {aiSuggested.reason}
                    </p>
                    <Link
                      href={`/dashboard/movies/${aiSuggested.id}`}
                      className="text-[9px] text-brand-blue hover:text-brand-purple font-bold block pt-1 hover:underline"
                    >
                      View Cinematic Details →
                    </Link>
                  </div>
                )}
              </GlassCard>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
