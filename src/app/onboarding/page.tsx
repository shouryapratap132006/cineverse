"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, User, Compass, Star, ChevronRight, ChevronLeft, Check, Search } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { syncUserAccount, updateProfile } from "@/actions/user";
import { getTrendingMovies, Movie } from "@/lib/tmdb";
import { useAuth, useUser } from "@clerk/nextjs";

const CHARACTER_AVATARS = [
  // Hollywood
  { name: "Batman", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Batman&background=000&color=fff&size=120" },
  { name: "Joker", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Joker&background=4c1d95&color=fff&size=120" },
  { name: "Iron Man", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Iron+Man&background=b91c1c&color=fff&size=120" },
  { name: "Spider-Man", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Spider+Man&background=dc2626&color=fff&size=120" },
  { name: "Captain America", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Captain+America&background=1d4ed8&color=fff&size=120" },
  { name: "Deadpool", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Deadpool&background=ef4444&color=fff&size=120" },
  { name: "John Wick", category: "Hollywood", url: "https://ui-avatars.com/api/?name=John+Wick&background=111&color=fff&size=120" },
  { name: "Harry Potter", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Harry+Potter&background=7f1d1d&color=fff&size=120" },
  { name: "Hermione", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Hermione&background=9a3412&color=fff&size=120" },
  { name: "Darth Vader", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Darth+Vader&background=000&color=ef4444&size=120" },
  { name: "Luke Skywalker", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Luke+Skywalker&background=047857&color=fff&size=120" },
  { name: "Indiana Jones", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Indiana+Jones&background=78350f&color=fff&size=120" },
  { name: "Neo", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Neo&background=064e3b&color=34d399&size=120" },
  { name: "Jack Sparrow", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Jack+Sparrow&background=451a03&color=fff&size=120" },
  { name: "Sherlock Holmes", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Sherlock+Holmes&background=1e3a8a&color=fff&size=120" },
  { name: "Rocky", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Rocky&background=b91c1c&color=fff&size=120" },
  { name: "Rambo", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Rambo&background=064e3b&color=fff&size=120" },
  { name: "Terminator", category: "Hollywood", url: "https://ui-avatars.com/api/?name=Terminator&background=374151&color=ef4444&size=120" },

  // Bollywood
  { name: "Kabir Singh", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Kabir+Singh&background=b91c1c&color=fff&size=120" },
  { name: "Rancho", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Rancho&background=047857&color=fff&size=120" },
  { name: "Munna Bhai", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Munna+Bhai&background=d97706&color=fff&size=120" },
  { name: "Circuit", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Circuit&background=0f766e&color=fff&size=120" },
  { name: "Bunny", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Bunny&background=4338ca&color=fff&size=120" },
  { name: "Veer", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Veer&background=be123c&color=fff&size=120" },
  { name: "Sultan", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Sultan&background=b45309&color=fff&size=120" },
  { name: "Pushpa", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Pushpa&background=78350f&color=fff&size=120" },
  { name: "Rocky (KGF)", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Rocky&background=111&color=fbbf24&size=120" },
  { name: "RRR Characters", category: "Bollywood", url: "https://ui-avatars.com/api/?name=RRR&background=b91c1c&color=fff&size=120" },
  { name: "Bajirao", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Bajirao&background=9a3412&color=fff&size=120" },
  { name: "Chulbul Pandey", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Chulbul+Pandey&background=047857&color=fff&size=120" },
  { name: "Don", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Don&background=000&color=fff&size=120" },
  { name: "Mogambo", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Mogambo&background=312e81&color=fff&size=120" },
  { name: "Gabbar Singh", category: "Bollywood", url: "https://ui-avatars.com/api/?name=Gabbar+Singh&background=3f3f46&color=fff&size=120" },

  // Anime
  { name: "Luffy", category: "Anime", url: "https://ui-avatars.com/api/?name=Luffy&background=b91c1c&color=fff&size=120" },
  { name: "Naruto", category: "Anime", url: "https://ui-avatars.com/api/?name=Naruto&background=d97706&color=fff&size=120" },
  { name: "Itachi", category: "Anime", url: "https://ui-avatars.com/api/?name=Itachi&background=000&color=ef4444&size=120" },
  { name: "Gojo", category: "Anime", url: "https://ui-avatars.com/api/?name=Gojo&background=1e3a8a&color=fff&size=120" },
  { name: "Levi", category: "Anime", url: "https://ui-avatars.com/api/?name=Levi&background=064e3b&color=fff&size=120" },
  { name: "Eren", category: "Anime", url: "https://ui-avatars.com/api/?name=Eren&background=451a03&color=fff&size=120" },
  { name: "Tanjiro", category: "Anime", url: "https://ui-avatars.com/api/?name=Tanjiro&background=047857&color=fff&size=120" },
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
  const { isSignedIn: isMockSignedIn, user: mockUser, updateUser } = useCineverseAuth();
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(CHARACTER_AVATARS[0].url);
  const [bannerUrl, setBannerUrl] = useState(BANNERS[0]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [actors, setActors] = useState("");
  const [directors, setDirectors] = useState("");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("United States");
  
  const [avatarSearch, setAvatarSearch] = useState("");
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
          if (res.success && res.user?.profile?.username) {
            setUsername(res.user.profile.username);
            
            // If the user already existed in our PostgreSQL database and has genres picked, they are onboarded
            if (!res.isNewUser && res.user.profile.favoriteGenres && res.user.profile.favoriteGenres.length > 0) {
              router.replace("/dashboard");
            }
          }
        });
      
      // Load Movies for Step 3
      getTrendingMovies().then((m) => setMoviesCatalog(m));
    }
  }, [isMockSignedIn, isClerkSignedIn, isClerkLoaded, clerkUser, mockUser, router]);

  const filteredAvatars = CHARACTER_AVATARS.filter(c => c.name.toLowerCase().includes(avatarSearch.toLowerCase()));

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
        router.push("/dashboard");
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
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Character Avatar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={avatarSearch}
                      onChange={(e) => setAvatarSearch(e.target.value)}
                      placeholder="Search character (e.g. Batman, Luffy)..."
                      className="w-full py-2 pl-9 pr-4 rounded-lg glass-input text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                    {filteredAvatars.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setAvatarUrl(c.url)}
                        title={`${c.name} (${c.category})`}
                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition mx-auto ${
                          avatarUrl === c.url ? "border-brand-purple scale-110 shadow-lg shadow-brand-purple/30" : "border-transparent opacity-50 hover:opacity-100"
                        }`}
                      >
                        <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
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
