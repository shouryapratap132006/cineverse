"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, User, Compass, Star, ChevronRight, ChevronLeft, Check } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { syncUserAccount, updateProfile } from "@/actions/user";
import { getTrendingMovies, Movie } from "@/lib/tmdb";
import { useAuth, useUser } from "@clerk/nextjs";

// Real actor & actress headshot photos
const ACTOR_AVATARS = [
  // Male actors
  { url: "https://randomuser.me/api/portraits/men/1.jpg" },
  { url: "https://randomuser.me/api/portraits/men/2.jpg" },
  { url: "https://randomuser.me/api/portraits/men/3.jpg" },
  { url: "https://randomuser.me/api/portraits/men/4.jpg" },
  { url: "https://randomuser.me/api/portraits/men/5.jpg" },
  { url: "https://randomuser.me/api/portraits/men/6.jpg" },
  { url: "https://randomuser.me/api/portraits/men/7.jpg" },
  { url: "https://randomuser.me/api/portraits/men/8.jpg" },
  { url: "https://randomuser.me/api/portraits/men/9.jpg" },
  { url: "https://randomuser.me/api/portraits/men/10.jpg" },
  { url: "https://randomuser.me/api/portraits/men/11.jpg" },
  { url: "https://randomuser.me/api/portraits/men/12.jpg" },
  { url: "https://randomuser.me/api/portraits/men/13.jpg" },
  { url: "https://randomuser.me/api/portraits/men/14.jpg" },
  { url: "https://randomuser.me/api/portraits/men/15.jpg" },
  { url: "https://randomuser.me/api/portraits/men/16.jpg" },
  { url: "https://randomuser.me/api/portraits/men/17.jpg" },
  { url: "https://randomuser.me/api/portraits/men/18.jpg" },
  { url: "https://randomuser.me/api/portraits/men/19.jpg" },
  { url: "https://randomuser.me/api/portraits/men/20.jpg" },
  // Female actresses
  { url: "https://randomuser.me/api/portraits/women/1.jpg" },
  { url: "https://randomuser.me/api/portraits/women/2.jpg" },
  { url: "https://randomuser.me/api/portraits/women/3.jpg" },
  { url: "https://randomuser.me/api/portraits/women/4.jpg" },
  { url: "https://randomuser.me/api/portraits/women/5.jpg" },
  { url: "https://randomuser.me/api/portraits/women/6.jpg" },
  { url: "https://randomuser.me/api/portraits/women/7.jpg" },
  { url: "https://randomuser.me/api/portraits/women/8.jpg" },
  { url: "https://randomuser.me/api/portraits/women/9.jpg" },
  { url: "https://randomuser.me/api/portraits/women/10.jpg" },
  { url: "https://randomuser.me/api/portraits/women/11.jpg" },
  { url: "https://randomuser.me/api/portraits/women/12.jpg" },
  { url: "https://randomuser.me/api/portraits/women/13.jpg" },
  { url: "https://randomuser.me/api/portraits/women/14.jpg" },
  { url: "https://randomuser.me/api/portraits/women/15.jpg" },
  { url: "https://randomuser.me/api/portraits/women/16.jpg" },
  { url: "https://randomuser.me/api/portraits/women/17.jpg" },
  { url: "https://randomuser.me/api/portraits/women/18.jpg" },
  { url: "https://randomuser.me/api/portraits/women/19.jpg" },
  { url: "https://randomuser.me/api/portraits/women/20.jpg" },
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

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { isSignedIn: isMockSignedIn, user: mockUser, updateUser } = useCineverseAuth();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(ACTOR_AVATARS[0].url);
  const [bannerUrl, setBannerUrl] = useState(BANNERS[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [actors, setActors] = useState("");
  const [directors, setDirectors] = useState("");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("United States");
  
  const [moviesCatalog, setMoviesCatalog] = useState<Movie[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Wait for Clerk to load if keys are present
    if (!isClerkLoaded && typeof process !== "undefined" && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      return;
    }

    if (!isMockSignedIn && !isClerkSignedIn) {
      router.push("/auth/sign-in");
    } else {
      // Sync DB Account First
      let id = "";
      let email = "";
      let name = "";

      if (isClerkSignedIn && clerkUser) {
        id = clerkUser.id;
        email = clerkUser.primaryEmailAddress?.emailAddress || "";
        name = clerkUser.username || clerkUser.firstName || clerkUser.lastName || "";
      } else if (mockUser) {
        id = mockUser.id;
        email = mockUser.email || "";
        name = mockUser.username || "";
      }

      syncUserAccount(id ? { id, email, username: name } : undefined)
        .then((res) => {
          if (res.success && res.user?.profile) {
            const p = res.user.profile;
            if (p.username) setUsername(p.username);
            if (p.bio) setBio(p.bio);
            if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
            if (p.bannerUrl) setBannerUrl(p.bannerUrl);
            if (p.favoriteGenres?.length) setSelectedGenres(p.favoriteGenres);
            if (p.language) setLanguage(p.language);
            if (p.country) setCountry(p.country);
            if (p.favoriteActors?.length) setActors(p.favoriteActors.join(", "));
            if (p.favoriteDirectors?.length) setDirectors(p.favoriteDirectors.join(", "));

            // Skip redirect if user is in edit mode
            if (!isEditMode && !res.isNewUser && p.favoriteGenres && p.favoriteGenres.length > 0) {
              router.replace("/dashboard");
            }
          }
        });
      
      // Load Movies for Step 3
      getTrendingMovies().then((m) => setMoviesCatalog(m));
    }
  }, [isMockSignedIn, isClerkSignedIn, isClerkLoaded, clerkUser, mockUser, router, isEditMode]);



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

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      const res = await updateProfile({
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
      });
      
      if (res.success) {
        updateUser({
          username,
          avatarUrl,
          bannerUrl,
          bio,
          favoriteGenres: selectedGenres,
          favoriteMovies: selectedMovies,
          isOnboarded: true,
        });
        router.push(isEditMode ? "/dashboard/profile" : "/dashboard");
      } else {
        alert("Failed to update profile: " + res.error);
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6 bg-brand-dark overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-brand-blue/15 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-brand-purple/15 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl space-y-8">
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

        <GlassCard hoverGlow={false} className="border-white/10 shadow-2xl p-8 space-y-6">
          
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
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community about your film preferences..."
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Your Avatar Photo</label>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                    {ACTOR_AVATARS.map((a, i) => (
                      <button
                        key={a.url}
                        type="button"
                        onClick={() => setAvatarUrl(a.url)}
                        className={`rounded-full border-2 transition overflow-hidden ${
                          avatarUrl === a.url
                            ? "border-brand-purple shadow-lg shadow-brand-purple/30 scale-110"
                            : "border-transparent hover:border-white/30 hover:scale-105"
                        }`}
                      >
                        <img
                          src={a.url}
                          alt={`Avatar ${i + 1}`}
                          className="w-10 h-10 object-cover block"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                  {/* Preview selected avatar */}
                  {avatarUrl && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <img src={avatarUrl} alt="Selected" className="w-10 h-10 rounded-full border-2 border-brand-purple object-cover" />
                      <span className="text-xs font-semibold text-slate-300">Selected</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Profile Banner</label>
                  <div className="grid grid-cols-3 gap-3">
                    {BANNERS.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setBannerUrl(url)}
                        className={`relative h-12 rounded-xl overflow-hidden border-2 transition ${
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

          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-white/5 pb-3">
                <Compass className="w-4.5 h-4.5 text-brand-blue" />
                <span>2. Film Preferences & Locale</span>
              </h3>

              <div className="space-y-5">
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

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-white/5 pb-3">
                <Star className="w-4.5 h-4.5 text-brand-gold" />
                <span>3. Specific Favorites</span>
              </h3>

              <div className="space-y-5">
                <div className="space-y-2.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Select Favorite Movies (From catalog)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {moviesCatalog.slice(0, 6).map((movie) => {
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
                    placeholder="Matthew McConaughey, Anne Hathaway"
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Favorite Directors</label>
                  <input
                    type="text"
                    value={directors}
                    onChange={(e) => setDirectors(e.target.value)}
                    placeholder="Christopher Nolan, Denis Villeneuve"
                    className="w-full py-3 px-4 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1 || isSubmitting}
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
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-semibold hover:opacity-90 transition flex items-center space-x-2 cursor-pointer active:scale-95 shadow-xl shadow-brand-purple/10 disabled:opacity-50"
            >
              <span>
                {isSubmitting ? "Saving..." : step === 3 ? "Complete Setup" : "Continue"}
              </span>
              {!isSubmitting && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" /></div>}>
      <OnboardingForm />
    </Suspense>
  );
}
