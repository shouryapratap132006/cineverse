"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search, Star, ChevronLeft, ChevronRight, TrendingUp, Flame,
  Clock, Award, Clapperboard, Sparkles, Globe2, Heart,
  Popcorn, Film, Zap, Filter, ArrowLeft, X
} from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { MOCK_MOVIES } from "@/lib/mockData";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

function mapMockMovieToUi(movie: any) {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    release_date: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : null,
    vote_average: movie.rating,
    poster_path: null,
    posterUrl: movie.posterUrl,
    genre_ids: movie.genres?.map((genre: string) => GENRE_IDS[genre] ?? 0).filter(Boolean) || [],
    releaseYear: movie.releaseYear,
  };
}

function getLocalMovieResults(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? MOCK_MOVIES.filter((movie) => {
        const haystack = [
          movie.title,
          movie.overview,
          movie.genres.join(" "),
          movie.cast.map((person) => person.name).join(" "),
          movie.crew.map((person) => person.name).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized);
      })
    : MOCK_MOVIES;

  return filtered.slice(0, 20).map(mapMockMovieToUi);
}

function getLocalPersonMovies(personName: string) {
  const normalized = personName.trim().toLowerCase();
  if (!normalized) return [];

  return MOCK_MOVIES.filter((movie) => {
    const people = [
      ...movie.cast.map((person) => person.name),
      ...movie.crew.map((person) => person.name),
    ];
    return people.some((person) => person.toLowerCase().includes(normalized));
  })
    .slice(0, 20)
    .map(mapMockMovieToUi);
}

// Lightweight movie fetcher (poster-only, no deep detail fetch)
async function fetchRow(url: string): Promise<any[]> {
  if (!TMDB_KEY) {
    const queryMatch = url.match(/[?&]query=([^&]+)/i);
    const query = queryMatch ? decodeURIComponent(queryMatch[1]) : "";
    return getLocalMovieResults(query);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return getLocalMovieResults();
    const data = await res.json();
    return (data.results || []).slice(0, 20);
  } catch {
    return getLocalMovieResults();
  }
}

async function searchPersonMovies(personName: string): Promise<any[]> {
  if (!TMDB_KEY) return getLocalPersonMovies(personName);
  try {
    const personRes = await fetch(`${BASE}/search/person?api_key=${TMDB_KEY}&query=${encodeURIComponent(personName)}&page=1`);
    const personData = await personRes.json();
    const person = personData.results?.[0];
    if (!person?.id) return getLocalPersonMovies(personName);

    const creditsRes = await fetch(`${BASE}/person/${person.id}/movie_credits?api_key=${TMDB_KEY}&language=en-US`);
    const creditsData = await creditsRes.json();
    return (creditsData.cast || []).slice(0, 20);
  } catch {
    return getLocalPersonMovies(personName);
  }
}

// Genre IDs
const GENRE_IDS: Record<string, number> = {
  Action: 28, Comedy: 35, Drama: 18, Horror: 27, Romance: 10749,
  "Sci-Fi": 878, Thriller: 53, Animation: 16, Documentary: 99,
  Fantasy: 14, Crime: 80, Mystery: 9648, Family: 10751, History: 36,
  Music: 10402, War: 10752, Western: 37,
};

// Row definitions
const ROW_CONFIGS = [
  { id: "trending_day", label: "Trending Today", icon: Flame, color: "from-orange-500/20 to-red-500/20", accent: "text-orange-400", url: () => `${BASE}/trending/movie/day?api_key=${TMDB_KEY}` },
  { id: "trending_week", label: "This Week's Buzz", icon: TrendingUp, color: "from-brand-blue/20 to-cyan-500/20", accent: "text-cyan-400", url: () => `${BASE}/trending/movie/week?api_key=${TMDB_KEY}` },
  { id: "now_playing", label: "Now In Cinemas", icon: Film, color: "from-pink-500/20 to-rose-500/20", accent: "text-pink-400", url: () => `${BASE}/movie/now_playing?api_key=${TMDB_KEY}&language=en-US&page=1` },
  { id: "top_rated", label: "All-Time Classics", icon: Award, color: "from-yellow-500/20 to-amber-500/20", accent: "text-yellow-400", url: () => `${BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1` },
  { id: "upcoming", label: "Coming Soon", icon: Clock, color: "from-violet-500/20 to-purple-500/20", accent: "text-violet-400", url: () => `${BASE}/movie/upcoming?api_key=${TMDB_KEY}&language=en-US&page=1` },
  { id: "popular", label: "Most Popular Right Now", icon: Globe2, color: "from-green-500/20 to-emerald-500/20", accent: "text-green-400", url: () => `${BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=1` },
  { id: "action", label: "Action & Adrenaline", icon: Zap, color: "from-red-500/20 to-orange-500/20", accent: "text-red-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=28&sort_by=popularity.desc` },
  { id: "scifi", label: "Sci-Fi & Space", icon: Sparkles, color: "from-sky-500/20 to-indigo-500/20", accent: "text-sky-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=878&sort_by=popularity.desc` },
  { id: "comedy", label: "Laugh Out Loud", icon: Popcorn, color: "from-yellow-400/20 to-lime-500/20", accent: "text-lime-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=35&sort_by=popularity.desc` },
  { id: "horror", label: "Horror & Suspense", icon: Flame, color: "from-slate-700/40 to-red-900/30", accent: "text-red-500", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=27&sort_by=popularity.desc` },
  { id: "romance", label: "Love Stories", icon: Heart, color: "from-pink-500/20 to-rose-400/20", accent: "text-rose-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=10749&sort_by=popularity.desc` },
  { id: "drama", label: "Award-Winning Dramas", icon: Clapperboard, color: "from-amber-600/20 to-yellow-500/20", accent: "text-amber-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=18&sort_by=vote_average.desc&vote_count.gte=1000` },
  { id: "bollywood", label: "Bollywood Blockbusters", icon: Sparkles, color: "from-orange-400/20 to-amber-400/20", accent: "text-orange-300", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_original_language=hi&sort_by=popularity.desc` },
  { id: "anime", label: "Anime Films", icon: Sparkles, color: "from-violet-600/20 to-pink-500/20", accent: "text-violet-300", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=16&with_keywords=210024&sort_by=popularity.desc` },
  { id: "90s", label: "90s Nostalgia", icon: Film, color: "from-teal-500/20 to-cyan-600/20", accent: "text-teal-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31&sort_by=vote_average.desc&vote_count.gte=500` },
  { id: "2000s", label: "2000s Throwbacks", icon: Film, color: "from-indigo-500/20 to-blue-500/20", accent: "text-indigo-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&primary_release_date.gte=2000-01-01&primary_release_date.lte=2009-12-31&sort_by=vote_average.desc&vote_count.gte=500` },
  { id: "2020s", label: "Fresh From the 2020s", icon: Zap, color: "from-emerald-500/20 to-green-400/20", accent: "text-emerald-400", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&primary_release_date.gte=2020-01-01&sort_by=popularity.desc` },
  { id: "documentary", label: "Eye-Opening Docs", icon: Globe2, color: "from-slate-600/30 to-zinc-500/20", accent: "text-slate-300", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=99&sort_by=vote_average.desc&vote_count.gte=200` },
  { id: "oscar", label: "Oscar Winners", icon: Award, color: "from-yellow-600/20 to-gold-500/20", accent: "text-yellow-300", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_keywords=10945&sort_by=vote_average.desc&vote_count.gte=500` },
  { id: "thriller", label: "Edge-of-Seat Thrillers", icon: Zap, color: "from-slate-800/50 to-zinc-700/30", accent: "text-slate-300", url: () => `${BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=53&sort_by=vote_average.desc&vote_count.gte=500` },
];

function MovieCard({ movie, priority = false }: { movie: any; priority?: boolean }) {
  const poster = movie.poster_path ? `${IMG}/w342${movie.poster_path}` : movie.posterUrl || null;
  const rating = movie.vote_average?.toFixed ? movie.vote_average.toFixed(1) : movie.vote_average;
  const year = movie.release_date?.split("-")[0] || movie.releaseYear;

  return (
    <Link
      href={`/dashboard/movies/${movie.id}`}
      className="group shrink-0 w-36 sm:w-40 md:w-44"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/8 shadow-lg group-hover:border-brand-purple/50 transition-all duration-300 bg-slate-900">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <Film className="w-8 h-8 text-slate-600" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Rating */}
        {rating && Number(rating) > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md border border-white/10">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[9px] font-bold text-amber-400">{rating}</span>
          </div>
        )}

        {/* Hover CTA */}
        <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-full py-1.5 px-2 bg-gradient-to-r from-brand-blue to-brand-purple rounded-lg text-[9px] font-bold text-white text-center shadow-lg">
            View Details
          </div>
        </div>
      </div>

      <div className="mt-2 px-0.5 space-y-0.5">
        <h4 className="text-xs font-bold text-slate-300 group-hover:text-white truncate transition">
          {movie.title}
        </h4>
        <span className="text-[10px] text-slate-500">{year}</span>
      </div>
    </Link>
  );
}

function MovieRow({ config, recommendedFor }: { config: typeof ROW_CONFIGS[0]; recommendedFor?: string }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const Icon = config.icon;

  useEffect(() => {
    let url = config.url();
    // If this is a "because you liked" row, append recommendation endpoint
    if (recommendedFor) {
      url = `${BASE}/movie/${recommendedFor}/recommendations?api_key=${TMDB_KEY}&language=en-US`;
    }
    fetchRow(url).then(data => {
      setMovies(data);
      setLoading(false);
    });
  }, [config.id, recommendedFor]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 20);
    setCanScrollRight(
      scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 20
    );
  };

  if (!loading && movies.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Row header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.color} border border-white/10 flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${config.accent}`} />
          </div>
          <h2 className={`text-sm font-extrabold text-white tracking-tight`}>
            {config.label}
          </h2>
          {loading && (
            <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-default transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-default transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable strip */}
      <div className="relative">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-3 pt-1"
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 w-36 sm:w-40 md:w-44 space-y-2 animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-slate-800/80 border border-white/5" />
                <div className="h-3 bg-slate-800 rounded w-3/4" />
                <div className="h-2.5 bg-slate-800 rounded w-1/2" />
              </div>
            ))
            : movies.map((m, i) => (
              <MovieCard key={m.id} movie={m} priority={i < 4} />
            ))
          }
        </div>
      </div>
    </section>
  );
}

// Hero spotlight on the first trending movie
function HeroSpotlight({ movie }: { movie: any }) {
  if (!movie) return null;
  const backdrop = movie.backdrop_path ? `${IMG}/w1280${movie.backdrop_path}` : null;
  const poster = movie.poster_path ? `${IMG}/w500${movie.poster_path}` : null;
  const year = movie.release_date?.split("-")[0];

  return (
    <Link href={`/dashboard/movies/${movie.id}`} className="group block relative w-full h-[360px] md:h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8">
      {backdrop && (
        <img src={backdrop} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-5 md:p-12 flex items-end gap-4 md:gap-6">
        {poster && (
          <img src={poster} alt="" className="hidden md:block w-28 rounded-xl border border-white/20 shadow-2xl shrink-0 group-hover:scale-105 transition duration-500" />
        )}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-brand-purple/80 backdrop-blur rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
              🔥 Trending #1
            </span>
            {movie.vote_average > 0 && (
              <span className="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur border border-white/20 rounded-lg text-[10px] font-bold text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {movie.vote_average?.toFixed(1)}
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-2xl md:text-5xl text-white drop-shadow-2xl leading-tight">
            {movie.title}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl line-clamp-2 leading-relaxed">
            {movie.overview}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{year}</span>
            <span className="w-1 h-1 rounded-full bg-slate-500" />
            <span className="text-xs text-slate-400">{movie.vote_count?.toLocaleString()} votes</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-blue to-brand-purple rounded-xl text-sm font-bold text-white shadow-xl group-hover:shadow-brand-purple/30 transition">
              <Film className="w-4 h-4" />
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useCineverseAuth();
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState("All");
  
  const [becauseYouLikedId, setBecauseYouLikedId] = useState("157336"); // Interstellar
  const [becauseYouLikedTitle, setBecauseYouLikedTitle] = useState("Interstellar");
  const personParam = searchParams.get("person");

  // Fetch hero (first trending movie)
  useEffect(() => {
    fetchRow(`${BASE}/trending/movie/day?api_key=${TMDB_KEY}`).then(data => {
      if (data[0]) setHeroMovie(data[0]);
    });
  }, []);

  // Dynamically load user's favorite movie recommendation source
  useEffect(() => {
    if (user?.favoriteMovies && user.favoriteMovies.length > 0) {
      const favMovie = user.favoriteMovies[0];
      fetch(`${BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(favMovie)}&page=1`)
        .then(res => res.json())
        .then(data => {
          if (data.results && data.results[0]) {
            setBecauseYouLikedId(String(data.results[0].id));
            setBecauseYouLikedTitle(data.results[0].title);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Search handler
  useEffect(() => {
    if (personParam) {
      setSearchMode(true);
      setQuery(personParam);
      setActiveGenre("All");
      setSearchLoading(true);
      searchPersonMovies(personParam).then((data) => {
        setSearchResults(data);
        setSearchLoading(false);
      });
      return;
    }

    if (!query.trim()) {
      setSearchResults([]);
      setSearchMode(false);
      return;
    }

    setSearchMode(true);
    const t = setTimeout(async () => {
      setSearchLoading(true);
      const data = await fetchRow(`${BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`);
      setSearchResults(data);
      setSearchLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, [query, personParam]);

  // Genre filter for search results
  const filteredResults = activeGenre === "All"
    ? searchResults
    : searchResults.filter(m => m.genre_ids?.includes(GENRE_IDS[activeGenre]));

  return (
    <div className="min-h-screen pb-16">

      {/* Sticky Search & Genre Bar */}
      <div className="sticky top-0 z-30 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSearchMode(!!e.target.value); }}
              placeholder="Search movies, directors, actors..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-purple/60 transition"
            />
            {query && (
              <button
                onClick={() => { setQuery(""); setSearchMode(false); setSearchResults([]); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Genre pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["All", ...Object.keys(GENRE_IDS)].map(g => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                activeGenre === g
                  ? "bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border-brand-purple/50 text-white"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 md:px-8 pt-6 space-y-10">

        {/* SEARCH MODE */}
        {searchMode ? (
          <section>
            <div className="flex items-center gap-2 mb-5">
              <button onClick={() => { setQuery(""); setSearchMode(false); setSearchResults([]); }} className="text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-extrabold text-white">
                Results for <span className="text-brand-purple">"{personParam || query}"</span>
              </h2>
              {!searchLoading && (
                <span className="text-xs text-slate-500 ml-1">({filteredResults.length} found)</span>
              )}
            </div>

            {searchLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[2/3] rounded-xl bg-slate-800 border border-white/5" />
                    <div className="h-3 bg-slate-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <Film className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <p className="font-bold text-lg text-slate-300">No matches found</p>
                <p className="text-sm mt-1">Try a different title or spelling.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredResults.map((m, i) => (
                  <MovieCard key={m.id} movie={m} priority={i < 5} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* BROWSE MODE — All rows */
          <>
            {/* Hero Spotlight */}
            <HeroSpotlight movie={heroMovie} />

            {/* All movie rows */}
            {ROW_CONFIGS.slice(0, 3).map(cfg => (
              <MovieRow key={cfg.id} config={cfg} />
            ))}

            {/* "Because you liked" row */}
            <MovieRow
              key={`because_liked_${becauseYouLikedId}`}
              config={{
                ...ROW_CONFIGS[0],
                id: "because_liked",
                label: `🎯 Because You Liked ${becauseYouLikedTitle}`,
                color: "from-indigo-500/20 to-blue-600/20",
                accent: "text-indigo-300",
              }}
              recommendedFor={becauseYouLikedId}
            />

            {/* Remaining rows */}
            {ROW_CONFIGS.slice(3).map(cfg => (
              <MovieRow key={cfg.id} config={cfg} />
            ))}
          </>
        )}

      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DiscoverContent />
    </Suspense>
  );
}
