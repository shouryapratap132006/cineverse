"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSearchMovies } from "@/hooks/useMovies";
import { Search, Star, Filter, ArrowUpDown } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const GENRES = [
  "All", "Action", "Drama", "Sci-Fi", "Fantasy", 
  "Anime", "Thriller", "Comedy", "Romance", "Documentary"
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const genreParam = searchParams.get("genre") || "All";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState(genreParam);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<"rating" | "year">("rating");

  // Sync activeGenre with searchParams
  useEffect(() => {
    if (genreParam) {
      setActiveGenre(genreParam);
    }
  }, [genreParam]);

  // Debounce search input to avoid redundant API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch movies via React Query hook
  const { data: movies, isLoading } = useSearchMovies(debouncedQuery);

  // Filter movies by genre and sort them
  const filteredMovies = movies
    ?.filter((movie) => {
      if (activeGenre === "All") return true;
      return movie.genres.some((g) => g.toLowerCase() === activeGenre.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      return b.releaseYear - a.releaseYear;
    }) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-2xl md:text-3xl text-white">
          Discover Cinema
        </h1>
        <p className="text-xs text-slate-400">
          Search thousands of films, filter by genre, and find what to watch next.
        </p>
      </div>

      {/* Control Bar (Search & Options) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search Field */}
        <div className="md:col-span-6 relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, actor..."
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="md:col-span-3 relative flex items-center space-x-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full py-3 px-4 rounded-xl glass-input text-xs cursor-pointer appearance-none"
          >
            <option value="rating">Sort by Rating (Highest)</option>
            <option value="year">Sort by Release Year (Newest)</option>
          </select>
        </div>

        {/* Filter Summary */}
        <div className="md:col-span-3 flex items-center justify-end text-xs text-slate-400">
          <Filter className="w-4 h-4 text-brand-purple mr-2" />
          <span>Found {filteredMovies.length} results</span>
        </div>
      </div>

      {/* Genre Categories Bar */}
      <div className="flex space-x-2.5 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`py-2.5 px-4.5 rounded-xl text-xs font-semibold border transition shrink-0 cursor-pointer ${
              activeGenre === genre
                ? "bg-brand-purple/20 border-brand-purple text-white shadow-lg"
                : "bg-white/3 border-white/5 text-slate-400 hover:border-white/10"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="space-y-3 animate-pulse">
              <div className="w-full aspect-[2/3] bg-slate-900 rounded-2xl border border-white/5" />
              <div className="h-4 bg-slate-900 rounded w-3/4" />
              <div className="h-3 bg-slate-900 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-white/2 rounded-2xl border border-white/5 space-y-3">
          <p className="text-base text-slate-300 font-bold">No movies found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
            We couldn't find any matches in our database. Try checking your spelling or adjusting your genre filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <Link
              key={movie.id}
              href={`/dashboard/movies/${movie.id}`}
              className="group space-y-2.5 block"
            >
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/8 relative shadow-lg group-hover:border-brand-purple/40 transition duration-300">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition duration-500"
                  loading="lazy"
                />
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-slate-950/80 border border-white/10 flex items-center text-[9px] font-bold text-brand-gold">
                  <Star className="w-3 h-3 fill-brand-gold text-brand-gold mr-0.5" />
                  <span>{movie.rating}</span>
                </div>

                {/* Hover Quick Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                  <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-[10px] font-bold text-white shadow-lg">
                    View Details
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition duration-200">
                  {movie.title}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {movie.releaseYear} • {movie.genres.slice(0, 2).join(", ")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-slate-400 text-xs">
          Loading catalog filters...
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
