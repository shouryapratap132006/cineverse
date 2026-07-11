"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserLibrary, removeFromAllLists } from "@/actions/watchlist";
import { Star, Bookmark, Trash2, Compass, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import WatchlistBuilder from "@/components/ai/WatchlistBuilder";

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<"want-to-watch" | "watched" | "favorite" | "ai-builder">("want-to-watch");
  
  const [dbWatchlist, setDbWatchlist] = useState<any[]>([]);
  const [dbFavorites, setDbFavorites] = useState<any[]>([]);
  const [moviesList, setMoviesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);

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
    } else if (activeTab === "ai-builder") {
      setMoviesList([]);
    } else {
      setMoviesList(dbWatchlist.filter(m => m.status === activeTab));
    }
  }, [dbWatchlist, dbFavorites, activeTab]);

  // Reset filters on tab switch
  useEffect(() => {
    setSearchQuery("");
    setSelectedGenre("All");
    setSortBy("default");
  }, [activeTab]);

  // Filter and Sort logic
  useEffect(() => {
    if (activeTab === "ai-builder") return;
    let result = [...moviesList];

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Genre filter
    if (selectedGenre && selectedGenre !== "All") {
      result = result.filter(m =>
        m.genres && m.genres.some((g: string) => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }

    // Sorting
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "rating-asc") {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "year-desc") {
      result.sort((a, b) => b.releaseYear - a.releaseYear);
    } else if (sortBy === "year-asc") {
      result.sort((a, b) => a.releaseYear - b.releaseYear);
    } else if (sortBy === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    setFilteredMovies(result);
  }, [moviesList, searchQuery, selectedGenre, sortBy, activeTab]);

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
    { key: "favorite", label: "My Favorites" },
    { key: "ai-builder", label: "AI Watchlist Builder ✨" }
  ];

  // Derive unique genres from the current tab's list of movies
  const genres = ["All", ...Array.from(new Set(moviesList.flatMap(m => m.genres || [])))].sort();

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

      {/* Filters Section (only show if loading is complete and moviesList has items) */}
      {!loading && moviesList.length > 0 && activeTab !== "ai-builder" && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/2 border border-white/5 p-4 rounded-2xl">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-brand-purple/50 transition"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Genre filter */}
            <div className="relative w-full sm:w-44">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-brand-purple/50 cursor-pointer"
              >
                {genres.map((g) => (
                  <option key={g} value={g} className="bg-slate-950">
                    {g === "All" ? "All Genres" : g}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div className="relative w-full sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-brand-purple/50 cursor-pointer"
              >
                <option value="default" className="bg-slate-950">Default Order</option>
                <option value="rating-desc" className="bg-slate-950">Rating: High to Low</option>
                <option value="rating-asc" className="bg-slate-950">Rating: Low to High</option>
                <option value="year-desc" className="bg-slate-950">Release: Newest First</option>
                <option value="year-asc" className="bg-slate-950">Release: Oldest First</option>
                <option value="title-asc" className="bg-slate-950">Title: A-Z</option>
                <option value="title-desc" className="bg-slate-950">Title: Z-A</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist Grid */}
      {activeTab === "ai-builder" ? (
        <WatchlistBuilder />
      ) : loading ? (
        <div className="text-center py-24">
          <Loader2 className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
        </div>
      ) : moviesList.length === 0 ? (
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
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-24 bg-white/2 rounded-2xl border border-white/5 space-y-2">
          <p className="text-sm font-semibold text-slate-400">No movies found</p>
          <p className="text-xs text-slate-500">Try matching a different keyword or genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fadeIn">
          {filteredMovies.map((movie) => (
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
                  <span>{movie.rating ? movie.rating.toFixed(1) : "0.0"}</span>
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
                  {movie.releaseYear} • {movie.genres[0] || "Unknown"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
