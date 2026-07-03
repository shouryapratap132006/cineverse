"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, User, Compass, Star, ChevronRight, ChevronLeft, Check } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { MOCK_MOVIES } from "@/lib/mockData";

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120",
];

const BANNERS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
];

const GENRES = [
  "Action", "Drama", "Sci-Fi", "Fantasy", "Anime", 
  "Thriller", "Comedy", "Romance", "Documentary", "Horror"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, user, updateUser } = useCineverseAuth();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(AVATARS[0]);
  const [bannerUrl, setBannerUrl] = useState(BANNERS[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [actors, setActors] = useState("");
  const [directors, setDirectors] = useState("");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("United States");

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/auth/sign-in");
    } else {
      setUsername(user?.username || "");
    }
  }, [isSignedIn, user, router]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleMovieToggle = (title: string) => {
    setSelectedMovies((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save profile details to localStorage & updateUser state
      const profile = {
        username,
        bio,
        avatarUrl,
        bannerUrl,
        favoriteGenres: selectedGenres,
        favoriteMovies: selectedMovies,
        favoriteActors: actors.split(",").map((s) => s.trim()).filter(Boolean),
        favoriteDirectors: directors.split(",").map((s) => s.trim()).filter(Boolean),
        language,
        country,
      };
      
      localStorage.setItem("cineverse_profile", JSON.stringify(profile));
      localStorage.setItem("cineverse_onboarded", "true");
      
      updateUser({
        username,
        avatarUrl,
        bannerUrl,
        bio,
        favoriteGenres: selectedGenres,
        favoriteMovies: selectedMovies,
        isOnboarded: true,
      });

      router.push("/dashboard");
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-brand-dark overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-blue/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white">
              <Film className="w-5 h-5 text-brand-purple" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-wider text-white">
              Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Configure Your Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Let other cinephiles discover what you love</p>
        </div>

        {/* Stepper Steps Tracker */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition border ${
                  step === s
                    ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/20"
                    : step > s
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-white/5 text-slate-400 border-white/10"
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-[2px] ml-4 rounded transition ${
                    step > s ? "bg-emerald-500/40" : "bg-white/5"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card containing Step Panels */}
        <GlassCard hoverGlow={false} className="border-white/10 shadow-2xl p-8 space-y-6">
          
          {/* STEP 1: Basic profiles */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-white/5 pb-3">
                <User className="w-4.5 h-4.5 text-brand-purple" />
                <span>1. Profile Basics</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Set your username"
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about your film preferences..."
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                {/* Avatar Selection */}
                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Avatar</label>
                  <div className="flex items-center space-x-4">
                    {AVATARS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition ${
                          avatarUrl === url ? "border-brand-purple scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Selection */}
                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Profile Banner</label>
                  <div className="grid grid-cols-3 gap-3">
                    {BANNERS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setBannerUrl(url)}
                        className={`relative h-16 rounded-xl overflow-hidden border-2 transition ${
                          bannerUrl === url ? "border-brand-purple scale-102 shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="banner" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Genres & Demographics */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-white/5 pb-3">
                <Compass className="w-4.5 h-4.5 text-brand-blue" />
                <span>2. Film Preferences & Locale</span>
              </h3>

              <div className="space-y-5">
                {/* Genres */}
                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Favorite Genres</label>
                  <div className="flex flex-wrap gap-2.5">
                    {GENRES.map((genre) => {
                      const isSelected = selectedGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleGenreToggle(genre)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-semibold border transition ${
                            isSelected
                              ? "bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/10"
                              : "bg-white/3 border-white/5 text-slate-400 hover:border-white/15"
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Preferred Language</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. English"
                      className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Favorite Specifics */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-white/5 pb-3">
                <Star className="w-4.5 h-4.5 text-brand-gold" />
                <span>3. Specific Favorites</span>
              </h3>

              <div className="space-y-5">
                {/* Favorite Movies */}
                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Select Favorite Movies (From catalog)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {MOCK_MOVIES.slice(0, 6).map((movie) => {
                      const isSelected = selectedMovies.includes(movie.title);
                      return (
                        <button
                          key={movie.id}
                          type="button"
                          onClick={() => handleMovieToggle(movie.title)}
                          className={`py-2 px-3 rounded-lg text-[10px] font-bold border transition text-left truncate ${
                            isSelected
                              ? "bg-brand-blue/20 border-brand-blue text-white"
                              : "bg-white/3 border-white/5 text-slate-400 hover:border-white/10"
                          }`}
                        >
                          {movie.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Favorite Actors</label>
                  <input
                    type="text"
                    value={actors}
                    onChange={(e) => setActors(e.target.value)}
                    placeholder="Matthew McConaughey, Anne Hathaway (comma separated)"
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Favorite Directors</label>
                  <input
                    type="text"
                    value={directors}
                    onChange={(e) => setDirectors(e.target.value)}
                    placeholder="Christopher Nolan, Denis Villeneuve (comma separated)"
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Buttons Controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={`py-2.5 px-5 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition cursor-pointer ${
                step === 1
                  ? "border-white/5 text-slate-600 cursor-not-allowed bg-transparent"
                  : "border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 transition flex items-center space-x-2 cursor-pointer active:scale-95 shadow-xl shadow-brand-purple/10"
            >
              <span>{step === 3 ? "Complete Setup" : "Continue"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}
