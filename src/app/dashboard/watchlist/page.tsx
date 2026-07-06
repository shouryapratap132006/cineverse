"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserLibrary, removeFromAllLists } from "@/actions/watchlist";
import { Star, Bookmark, Trash2, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<"want-to-watch" | "watched" | "favorite">("want-to-watch");
  
  const [dbWatchlist, setDbWatchlist] = useState<any[]>([]);
  const [dbFavorites, setDbFavorites] = useState<any[]>([]);
  const [moviesList, setMoviesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = () => {
    setLoading(true);
    getUserLibrary().then((res) => {
      if (res.success) {
        setDbWatchlist(res.watchlist || []);
        setDbFavorites(res.favorites || []);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  useEffect(() => {
    if (activeTab === "favorite") {
      setMoviesList(dbFavorites);
    } else {
      setMoviesList(dbWatchlist.filter(m => m.status === activeTab));
    }
  }, [dbWatchlist, dbFavorites, activeTab]);

  const handleRemove = async (id: string) => {
    const res = await removeFromAllLists(id);
    if (res.success) {
      setDbWatchlist(prev => prev.filter(m => m.id !== id));
      setDbFavorites(prev => prev.filter(m => m.id !== id));
    }
  };

  const tabs = [
    { key: "want-to-watch", label: "Want to Watch" },
    { key: "watched", label: "Already Watched" },
    { key: "favorite", label: "My Favorites" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
          My Cinema Library
        </h1>
        <p className="text-xs text-slate-400">
          Manage your watchlists, track finished logs, and look up your absolute favorites.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "pb-4 text-sm font-semibold border-b-2 transition duration-200 cursor-pointer relative",
              activeTab === tab.key
                ? "border-brand-purple text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <span className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-brand-blue to-brand-purple" />
            )}
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {moviesList.length === 0 ? (
        <div className="text-center py-24 bg-white/2 rounded-2xl border border-white/5 space-y-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-full inline-block text-slate-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white">Your list is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
              You haven't added any movies to this category yet. Explore the discover feed to build your watchlist.
            </p>
          </div>
          <Link
            href="/dashboard/discover"
            className="inline-flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-xs font-semibold text-white shadow-lg active:scale-95 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Films</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fadeIn">
          {moviesList.map((movie) => (
            <div
              key={movie.id}
              className="group space-y-2.5 block relative"
            >
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/8 relative shadow-lg group-hover:border-brand-purple/40 transition duration-300">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10 flex items-center text-[9px] font-bold text-brand-gold">
                  <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold mr-0.5" />
                  <span>{movie.rating}</span>
                </div>

                {/* Action Hover Controls */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center space-y-2.5 transition duration-300">
                  <Link
                    href={`/dashboard/movies/${movie.id}`}
                    className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[10px] font-bold text-white shadow-lg transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleRemove(movie.id)}
                    className="py-2 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-[10px] font-bold text-red-400 shadow-lg flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition duration-200">
                  {movie.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {movie.releaseYear} • {movie.genres[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
