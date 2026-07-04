"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTrendingMovies } from "@/hooks/useMovies";
import { useCineverseAuth } from "@/components/provider";
import { Sparkles, Play, Star } from "lucide-react";
import RightSidebar from "@/components/dashboard/RightSidebar";
import GlassCard from "@/components/shared/GlassCard";

import { getFeed } from "@/actions/social";
import PostComposer from "@/components/social/PostComposer";
import PostCard from "@/components/social/PostCard";

export default function DashboardPage() {
  const { user } = useCineverseAuth();
  const { data: trendingMovies, isLoading } = useTrendingMovies();

  // Social feed states
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Quick AI Companion state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggested, setAiSuggested] = useState<any>(null);
  const [aiSearching, setAiSearching] = useState(false);

  const fetchFeed = async () => {
    setLoadingFeed(true);
    const res = await getFeed();
    if (res.success && res.posts) {
      setFeedPosts(res.posts);
    }
    setLoadingFeed(false);
  };

  useEffect(() => {
    fetchFeed();
  }, [user]);

  const handleQuickAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiSearching(true);
    setAiSuggested(null);

    setTimeout(() => {
      // Simulated AI recommendation
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
          <p className="text-sm text-slate-400">Discover trending films, check your watchlists, and connect with your clubs.</p>
        </div>

        {/* Carousel: Trending Movies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-slate-200">Trending Cinema</h2>
            <Link href="/dashboard/discover" className="text-sm text-brand-blue hover:text-brand-purple font-semibold transition">
              Explore All
            </Link>
          </div>

          <div className="flex space-x-5 overflow-x-auto pb-4 no-scrollbar">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-[150px] flex-shrink-0 space-y-3 animate-pulse">
                  <div className="w-full aspect-[2/3] bg-slate-800 rounded-xl border border-white/5" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ))
            ) : (
              trendingMovies?.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/dashboard/movies/${movie.id}`}
                  className="w-[150px] flex-shrink-0 space-y-2 group block"
                >
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 relative shadow-lg group-hover:border-brand-purple/50 transition duration-300">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/90 border border-white/10 flex items-center text-[10px] font-bold text-brand-gold backdrop-blur-md">
                      <Star className="w-3 h-3 fill-brand-gold text-brand-gold mr-1" />
                      <span>{movie.rating}</span>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition duration-200">
                    {movie.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {movie.releaseYear} • {movie.genres[0]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Two Column Layout: Feed / Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Feed & Post Maker (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Post Creator */}
            <PostComposer onPostCreated={fetchFeed} />

            {/* Posts Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg text-white">Your Feed</h3>
                <div className="flex space-x-4 text-sm font-semibold text-slate-400">
                  <button className="text-white border-b-2 border-brand-blue pb-1">Following</button>
                  <button className="hover:text-white transition">Trending</button>
                </div>
              </div>

              {loadingFeed ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : feedPosts.length > 0 ? (
                feedPosts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={fetchFeed} />
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
                  <p>Your feed is quiet right now.</p>
                  <p className="text-sm mt-2">Follow some users or join communities to see posts here.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right: Continue Watching / Quick AI Ask (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Continue Watching */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                <Play className="w-3.5 h-3.5 text-brand-blue fill-brand-blue" />
                <span>Continue watching</span>
              </h3>
              
              <GlassCard hoverGlow={true} className="p-4 border-white/5 hover:border-white/10 group cursor-pointer transition-all duration-300">
                <div className="flex items-center space-x-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=100"
                    alt="Arrival"
                    className="w-12 h-16 object-cover rounded-lg border border-white/10 group-hover:border-brand-purple transition-colors"
                  />
                  <div className="space-y-1.5 w-full">
                    <h4 className="text-sm font-bold text-white leading-none">Arrival</h4>
                    <span className="text-[11px] text-slate-400 font-semibold block">48m left • Sci-Fi</span>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-brand-blue to-brand-purple h-full w-[70%]" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Quick AI Companion Widget */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
                <span>AI Recommendations</span>
              </h3>
              
              <GlassCard hoverGlow={false} className="p-4 border-white/10 bg-slate-900/50">
                <form onSubmit={handleQuickAiAsk} className="space-y-3">
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Tell AI what movie vibe you are seeking..."
                    className="w-full py-2.5 px-3 bg-slate-950 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none resize-none focus:border-brand-purple/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={aiSearching}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold hover:opacity-90 active:scale-95 transition flex items-center justify-center space-x-2"
                  >
                    {aiSearching ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Query Companion</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Return values */}
                {aiSuggested && (
                  <div className="mt-4 p-3 bg-slate-800/50 border border-brand-purple/30 rounded-xl space-y-2 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{aiSuggested.title}</h4>
                      <div className="flex items-center text-xs text-brand-gold font-bold">
                        <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold mr-1" />
                        <span>{aiSuggested.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {aiSuggested.reason}
                    </p>
                    <Link
                      href={`/dashboard/movies/${aiSuggested.id}`}
                      className="text-xs text-brand-purple hover:text-brand-blue font-bold inline-block pt-1 transition-colors"
                    >
                      View Details →
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
