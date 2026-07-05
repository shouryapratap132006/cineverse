"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMovieDetails } from "@/hooks/useMovies";
import { useCineverseAuth } from "@/components/provider";
import { toggleWatchlist, toggleFavorite, removeFromAllLists, getMovieLibraryState } from "@/actions/watchlist";
import { createReview, getMovieReviews } from "@/actions/review";
import { getRecommendations } from "@/lib/tmdb";
import { ArrowLeft, Star, Clock, Calendar, Bookmark, Flame, Heart, Sparkles, Send } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

export default function MovieDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useCineverseAuth();
  
  // Fetch details (API or Fallback)
  const { data: movie, isLoading, error } = useMovieDetails(id);

  const [watchlistStatus, setWatchlistStatus] = useState<string>("none");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  
  // Custom review writing states
  const [reviewText, setReviewText] = useState("");
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Sync state with storage on load
  useEffect(() => {
    if (!movie) return;

    // 1. Get database watchlist/favorite state
    getMovieLibraryState(id).then((state) => {
      setWatchlistStatus(state.watchlistStatus);
      setIsFavorite(state.isFavorite);
    });

    // 2. Fetch database critiques
    getMovieReviews(id).then((res) => {
      if (res.success && res.reviews) {
        const movieReviews = movie?.reviews || [];
        setReviewsList([...res.reviews, ...movieReviews]);
      }
    });

    // 3. Fetch real recommendations from TMDB
    getRecommendations(id).then((recs) => {
      setSimilarMovies(recs.slice(0, 4));
    });
  }, [id, movie]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-xs animate-pulse">
        Buffering film roll...
      </div>
    );
  }

  if (!movie || error) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Movie not found</h3>
        <p className="text-xs text-slate-500">We couldn't retrieve this film. It may not exist in the database.</p>
        <Link href="/dashboard/discover" className="inline-block py-2.5 px-5 rounded-xl bg-white/5 border border-white/10 text-xs text-white">
          Back to Discover
        </Link>
      </div>
    );
  }

  const handleWatchlistChange = async (status: string) => {
    const posterPath = movie.posterUrl ? movie.posterUrl.split("/p/w500")[1] || "" : "";
    
    if (status === "none") {
      const res = await removeFromAllLists(id);
      if (res.success) {
        setWatchlistStatus("none");
        setIsFavorite(false);
      }
    } else if (status === "favorite") {
      const res = await toggleFavorite(id, movie.title, posterPath);
      if (res.success) {
        setIsFavorite(!isFavorite);
      }
    } else {
      const dbStatus = status === "want-to-watch" ? "WANT_TO_WATCH" : "WATCHED";
      const res = await toggleWatchlist(id, movie.title, posterPath, dbStatus);
      if (res.success) {
        setWatchlistStatus(status);
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const posterPath = movie.posterUrl ? movie.posterUrl.split("/p/w500")[1] || "" : "";
    const res = await createReview(id, movie.title, posterPath, ratingInput * 2, reviewText);
    
    if (res.success && res.review) {
      const newReview = {
        id: res.review.id,
        user: user?.username || "cinephile",
        rating: res.review.rating,
        content: res.review.content,
        date: new Date(res.review.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
        avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      };

      setReviewsList([newReview, ...reviewsList]);
      setReviewText("");
      setRatingInput(5);
    } else {
      alert("Failed to submit review: " + res.error);
    }
  };

  // Convert runtime minutes to hours/minutes
  const formatRuntime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* Backdrop Header Canvas */}
      <div className="h-[460px] w-full relative overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover scale-102 filter blur-[1px]"
        />
        {/* Gradient dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-transparent to-transparent" />
        
        {/* Title Content container */}
        <div className="absolute bottom-10 left-6 md:left-12 right-6 md:right-12 max-w-7xl mx-auto flex flex-col items-start space-y-4">
          <Link
            href="/dashboard/discover"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-none">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-300 font-semibold pt-1">
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] uppercase font-bold text-white">
                {movie.releaseYear}
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {formatRuntime(movie.runtime)}
              </span>
              <div className="flex items-center text-brand-gold font-bold">
                <Star className="w-4.5 h-4.5 fill-brand-gold mr-0.5" />
                <span>{movie.rating} / 10</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-brand-purple font-bold">{movie.genres.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Column: Poster, Watchlist Status, Specs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full aspect-[2/3] object-cover rounded-2xl border border-white/8 shadow-2xl"
          />

          {/* Watchlist Manager Panel */}
          <GlassCard hoverGlow={false} className="p-5 border-white/8 bg-slate-950/40 space-y-4">
            <div className="flex items-center space-x-2 text-slate-200">
              <Bookmark className="w-4 h-4 text-brand-blue" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Watchlist Status</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => handleWatchlistChange("want-to-watch")}
                className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                  watchlistStatus === "want-to-watch"
                    ? "bg-brand-blue/20 border-brand-blue text-white"
                    : "bg-white/3 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                Want to Watch
              </button>
              <button
                onClick={() => handleWatchlistChange("watched")}
                className={`py-2 px-3 rounded-lg border text-center transition cursor-pointer ${
                  watchlistStatus === "watched"
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-white/3 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                Watched
              </button>
              <button
                onClick={() => handleWatchlistChange("favorite")}
                className={`col-span-2 py-2 px-3 rounded-lg border text-center transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                  isFavorite
                    ? "bg-brand-purple/20 border-brand-purple text-white"
                    : "bg-white/3 border-white/5 text-slate-400 hover:border-white/10"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-brand-purple text-brand-purple" : ""}`} />
                <span>Add as Favorite</span>
              </button>
            </div>
            
            {(watchlistStatus !== "none" || isFavorite) && (
              <button
                onClick={() => handleWatchlistChange("none")}
                className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase pt-1"
              >
                Remove from lists
              </button>
            )}
          </GlassCard>

          {/* Streaming & Production */}
          <GlassCard hoverGlow={false} className="p-5 border-white/5 bg-slate-950/40 space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Streaming availability</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.streamingPlatforms.map((plat) => (
                  <span
                    key={plat}
                    className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            <hr className="border-white/5" />

            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Release Date</span>
                <span className="text-slate-300">{movie.releaseDate}</span>
              </div>
              <div className="pt-2">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Production Studio</span>
                <span className="text-slate-300 truncate block">{movie.production.join(", ") || "N/A"}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Side Column: Trailer, Cast, Reviews (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Movie Trailer Embed */}
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/8 relative bg-slate-950">
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerUrl}`}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>

          {/* Overview */}
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-lg text-slate-200 border-b border-white/5 pb-2.5">
              Story Outline
            </h3>
            <p className="text-sm text-slate-300 font-light leading-relaxed">
              {movie.overview}
            </p>
          </div>

          {/* Cast */}
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-lg text-slate-200 border-b border-white/5 pb-2.5">
              Principal Cast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {movie.cast.map((c) => (
                <Link key={c.name} href={`/dashboard/discover?person=${encodeURIComponent(c.name)}`} className="flex items-center space-x-2.5 p-2 bg-white/3 border border-white/5 rounded-xl hover:border-brand-purple/40 transition">
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  <div className="space-y-0.5 truncate">
                    <h4 className="text-[11px] font-bold text-white truncate">{c.name}</h4>
                    <span className="text-[9px] text-slate-500 truncate block">{c.character}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Crew */}
          <div className="space-y-3.5">
            <h3 className="font-display font-bold text-lg text-slate-200 border-b border-white/5 pb-2.5">
              Production Crew
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {movie.crew.map((cr) => (
                <Link key={`${cr.name}-${cr.job}`} href={`/dashboard/discover?person=${encodeURIComponent(cr.name)}`} className="block space-y-0.5 rounded-xl border border-white/5 bg-white/3 p-2 transition hover:border-brand-purple/40">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{cr.job}</span>
                  <span className="text-xs font-bold text-white">{cr.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-lg text-slate-200 border-b border-white/5 pb-2.5">
              Reviews & Critique ({reviewsList.length})
            </h3>

            {/* Review Writer form */}
            <GlassCard hoverGlow={false} className="p-4 border-white/8 bg-slate-950/40">
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center">
                    <Sparkles className="w-4 h-4 text-brand-purple mr-1.5" />
                    <span>Rate and review this title</span>
                  </span>
                  
                  {/* Mouse Clickable Stars selection widget */}
                  <div className="flex items-center space-x-1.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingVal = i + 1;
                      const active = hoverRating !== null ? ratingVal <= hoverRating : ratingVal <= ratingInput;
                      return (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setHoverRating(ratingVal)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRatingInput(ratingVal)}
                          className="text-brand-gold hover:scale-110 active:scale-95 transition cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${active ? "fill-brand-gold" : "opacity-30"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <img
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Provide critique on acting styles, visuals, sound design, pacing..."
                    className="w-full py-2 px-3 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 transition flex items-center space-x-1.5"
                  >
                    <span>Submit Review</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </GlassCard>

            {/* Reviews display list */}
            <div className="space-y-4.5">
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 border border-white/5 bg-white/2 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rev.avatarUrl}
                        alt={rev.user}
                        className="w-8.5 h-8.5 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{rev.user}</h4>
                        <span className="text-[9px] text-slate-500">{rev.date}</span>
                      </div>
                    </div>
                    {/* Render rating stars (reviews ratings are out of 10, mapping to 5 stars) */}
                    <div className="flex items-center text-brand-gold text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold mr-0.5" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                    {rev.content}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Similar Movies */}
          <div className="space-y-4.5">
            <h3 className="font-display font-bold text-lg text-slate-200 border-b border-white/5 pb-2.5">
              Similar recommendations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarMovies.map((sim) => (
                <Link
                  key={sim.id}
                  href={`/dashboard/movies/${sim.id}`}
                  className="group space-y-1.5 block"
                >
                  <div className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/5 relative">
                    <img
                      src={sim.posterUrl}
                      alt={sim.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition duration-300"
                    />
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-300 truncate group-hover:text-white">
                    {sim.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
