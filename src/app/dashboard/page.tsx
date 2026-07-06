"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTrendingMovies } from "@/hooks/useMovies";
import { useCineverseAuth } from "@/components/provider";
import { Star } from "lucide-react";
import { getFeed } from "@/actions/social";
import PostComposer from "@/components/social/PostComposer";
import PostCard from "@/components/social/PostCard";

export default function DashboardPage() {
  const { user } = useCineverseAuth();
  const { data: trendingMovies, isLoading } = useTrendingMovies();

  // Social feed states
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

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

  return (
    <div className="flex w-full min-h-screen">
      {/* Scrollable Center Feed */}
      <div className="flex-grow w-full px-4 py-6 space-y-8 sm:px-6 md:px-10">
        
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="font-display font-extrabold text-xl md:text-3xl text-white">
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

        {/* Social Feed Column Layout */}
        <div className="max-w-4xl w-full space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-white">Your Feed</h3>
              <div className="flex space-x-4 text-sm font-semibold text-slate-400">
                <button className="text-white border-b-2 border-brand-blue pb-1">Following</button>
                <button className="hover:text-white transition">Trending</button>
              </div>
            </div>

            <PostComposer onPostCreated={fetchFeed} />

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

      </div>
    </div>
  );
}
