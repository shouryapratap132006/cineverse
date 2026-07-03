"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCineverseAuth } from "@/components/provider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Star, MapPin, Globe, Film, Award, Users, BookOpen, Clock } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { MOCK_MOVIES, Movie } from "@/lib/mockData";

export default function ProfilePage() {
  const { user } = useCineverseAuth();

  // Retrieve user custom profile details
  const [profile, setProfile] = useState<any>(null);
  
  // Watchlist count details
  const [watchlist] = useLocalStorage<Record<string, string>>("cineverse_watchlist_data", {});
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Stored reviews
  const [storedReviews] = useLocalStorage<Record<string, any[]>>("cineverse_movie_reviews", {});
  const [userReviewsCount, setUserReviewsCount] = useState(0);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  useEffect(() => {
    // Load local profile config
    const storedProfile = localStorage.getItem("cineverse_profile");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    } else {
      setProfile({
        username: user?.username || "cinephile",
        bio: user?.bio || "Film lover, critic, and member of CineVerse.",
        avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
        bannerUrl: user?.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
        favoriteGenres: ["Sci-Fi", "Drama", "Thriller"],
        favoriteMovies: ["Interstellar", "Parasite"],
        language: "English",
        country: "United States"
      });
    }

    // Calculate stats
    const watchListKeys = Object.keys(watchlist);
    setWatchlistCount(watchListKeys.filter((id) => watchlist[id] === "want-to-watch").length);
    setWatchedCount(watchListKeys.filter((id) => watchlist[id] === "watched").length);
    setFavoritesCount(watchListKeys.filter((id) => watchlist[id] === "favorite").length);

    // Extract user reviews
    let count = 0;
    const reviewsArr: any[] = [];
    Object.keys(storedReviews).forEach((movieId) => {
      const movie = MOCK_MOVIES.find((m) => m.id === movieId);
      const mReviews = storedReviews[movieId] || [];
      mReviews.forEach((rev) => {
        if (rev.user === (user?.username || "cinephile")) {
          count++;
          reviewsArr.push({
            ...rev,
            movieTitle: movie?.title || "Unknown Movie",
            movieId: movieId,
            posterUrl: movie?.posterUrl || ""
          });
        }
      });
    });

    setUserReviewsCount(count);
    setUserReviews(reviewsArr);
  }, [watchlist, storedReviews, user]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-xs animate-pulse">
        Loading critic profiles...
      </div>
    );
  }

  // Activity logs
  const activityLogs = [
    { type: "log", text: "Signed up and configured profile preferences", time: "Recent" },
    ...userReviews.map((rev) => ({
      type: "review",
      text: `Reviewed and rated "${rev.movieTitle}"`,
      time: rev.date
    })),
    ...Object.keys(watchlist).map((movieId) => {
      const movie = MOCK_MOVIES.find((m) => m.id === movieId);
      const status = watchlist[movieId];
      return {
        type: "watchlist",
        text: `Added "${movie?.title || "Movie"}" to ${status === "want-to-watch" ? "Watchlist" : status === "watched" ? "Watched logs" : "Favorites"}`,
        time: "Recent"
      };
    })
  ].slice(0, 5);

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* Cover Banner Header */}
      <div className="h-[280px] w-full relative overflow-hidden">
        <img
          src={profile.bannerUrl}
          alt="Profile Banner"
          className="w-full h-full object-cover filter brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
      </div>

      {/* Profile Overview Card (floating overlap style) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20 relative z-10 space-y-8">
        
        {/* User Card */}
        <GlassCard hoverGlow={false} className="p-6 md:p-8 border-white/10 bg-slate-950/40 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            
            {/* Left: Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-950 shadow-2xl relative -mt-16 md:mt-0"
              />
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                    {profile.username}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/20 text-[9px] font-bold uppercase tracking-wider">
                    Level 1 Critic
                  </span>
                </div>

                <p className="text-sm text-slate-300 font-light max-w-xl leading-relaxed">
                  {profile.bio}
                </p>

                <div className="flex items-center justify-center md:justify-start space-x-4 text-xs text-slate-400">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {profile.country}
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {profile.language}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex space-x-3.5">
              <Link
                href="/onboarding"
                className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition active:scale-95 cursor-pointer"
              >
                Edit Preferences
              </Link>
            </div>

          </div>

          {/* Stats Bar Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-white/5 pt-6 mt-8">
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Watchlist</span>
              <span className="text-lg font-extrabold text-white">{watchlistCount}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Watched</span>
              <span className="text-lg font-extrabold text-white">{watchedCount}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Favorites</span>
              <span className="text-lg font-extrabold text-white">{favoritesCount}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">My Reviews</span>
              <span className="text-lg font-extrabold text-white">{userReviewsCount}</span>
            </div>
            <div className="col-span-2 md:col-span-1 text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Reputation</span>
              <span className="text-sm font-extrabold text-brand-purple flex items-center justify-center md:justify-start">
                <Award className="w-4 h-4 mr-1 text-brand-purple fill-brand-purple/20" />
                <span>Bronze Star</span>
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Two Column Layout: Details / Feed activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Favorites & Genres (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Favorite Genres */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">Favorite Genres</h3>
              <GlassCard hoverGlow={false} className="p-4 border-white/5 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteGenres.map((g: string) => (
                    <span
                      key={g}
                      className="px-3 py-1.5 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-xs font-semibold text-brand-purple"
                    >
                      {g}
                    </span>
                  ))}
                  {profile.favoriteGenres.length === 0 && (
                    <span className="text-xs text-slate-500">No favorite genres selected.</span>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Favorite Movies */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">Favorite Movies</h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.favoriteMovies.map((title: string, index: number) => {
                  const matchedMovie = MOCK_MOVIES.find((m) => m.title === title);
                  return (
                    <div key={title} className="space-y-2 group block">
                      <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/5 relative">
                        <img
                          src={matchedMovie?.posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300"}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        {matchedMovie && (
                          <Link
                            href={`/dashboard/movies/${matchedMovie.id}`}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200"
                          >
                            <span className="px-3 py-1.5 rounded-xl bg-brand-purple text-[10px] font-bold text-white shadow-lg">
                              View details
                            </span>
                          </Link>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-300 truncate text-center">{title}</h4>
                    </div>
                  );
                })}
                {profile.favoriteMovies.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-xs text-slate-500">No favorite movies selected.</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: User Reviews & Activities (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Custom written reviews */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">My Critic Reviews</h3>
              <div className="space-y-4">
                {userReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white/2 rounded-2xl border border-white/5 text-xs text-slate-500 leading-normal">
                    You haven't published any critiques yet. Open movie details to write reviews.
                  </div>
                ) : (
                  userReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 border border-white/5 bg-white/2 rounded-2xl flex items-start space-x-4 hover:border-white/10 transition"
                    >
                      <img src={rev.posterUrl} alt={rev.movieTitle} className="w-12 h-18 object-cover rounded-lg border border-white/10 flex-shrink-0" />
                      <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">
                            Critique on <Link href={`/dashboard/movies/${rev.movieId}`} className="text-brand-purple hover:underline">{rev.movieTitle}</Link>
                          </h4>
                          <div className="flex items-center text-brand-gold text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-brand-gold mr-0.5" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          {rev.content}
                        </p>
                        <span className="text-[9px] text-slate-500 font-semibold block">{rev.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activities log */}
            <div className="space-y-3.5">
              <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">Activity History</h3>
              <GlassCard hoverGlow={false} className="p-5 border-white/5 space-y-4">
                {activityLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 text-xs leading-relaxed">
                    <div className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3 text-brand-blue" />
                    </div>
                    <div className="w-full flex justify-between">
                      <span className="text-slate-300 font-light">{log.text}</span>
                      <span className="text-[10px] text-slate-500 font-semibold ml-2 flex-shrink-0">{log.time}</span>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
