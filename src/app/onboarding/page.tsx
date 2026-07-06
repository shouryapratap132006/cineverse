"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, User, Compass, Star, ChevronRight, ChevronLeft, Check } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { syncUserAccount, updateProfile } from "@/actions/user";
import { getTrendingMovies, Movie } from "@/lib/tmdb";
import { useAuth, useUser } from "@clerk/nextjs";

// Hollywood & Bollywood actor/actress avatars (TMDB profile images)
const ACTOR_AVATARS = [
  // Hollywood Male
  { name: "Leonardo DiCaprio",  url: "https://image.tmdb.org/t/p/w185/mkdRcVIQl4WZhDf1vXKWTD7HZrZ.jpg" },
  { name: "Tom Hanks",          url: "https://image.tmdb.org/t/p/w185/oFvZoKI6lvU03n4YoNGAll9rkas.jpg" },
  { name: "Robert Downey Jr.",  url: "https://image.tmdb.org/t/p/w185/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg" },
  { name: "Brad Pitt",          url: "https://image.tmdb.org/t/p/w185/m09Y1YfPPeNYYUSHnnVqahkrC1o.jpg" },
  { name: "Denzel Washington",  url: "https://image.tmdb.org/t/p/w185/jj2Gcobpopokal0YstuCQW0ldJ4.jpg" },
  { name: "Morgan Freeman",     url: "https://image.tmdb.org/t/p/w185/jPsLqiYGSofU4s6BjrxnefMfabb.jpg" },
  { name: "Christian Bale",     url: "https://image.tmdb.org/t/p/w185/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg" },
  { name: "Matt Damon",         url: "https://image.tmdb.org/t/p/w185/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg" },
  { name: "Ryan Reynolds",      url: "https://image.tmdb.org/t/p/w185/trzgptffGvAlAT6MEu01fz47cLW.jpg" },
  { name: "Chris Evans",        url: "https://image.tmdb.org/t/p/w185/3bOGNsHlrswhyW79uvIHH1V43JI.jpg" },
  { name: "Tom Cruise",         url: "https://image.tmdb.org/t/p/w185/p17SLq4wabXwIYyjXF1Wf5cNnAm.jpg" },
  { name: "Keanu Reeves",       url: "https://image.tmdb.org/t/p/w185/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg" },
  // Hollywood Female
  { name: "Meryl Streep",       url: "https://image.tmdb.org/t/p/w185/g5cVxQBAQ3AXt3LhdBXtbbN47Uc.jpg" },
  { name: "Scarlett Johansson", url: "https://image.tmdb.org/t/p/w185/druW5adKddizHNSoPbI0q7Mvn0K.jpg" },
  { name: "Natalie Portman",    url: "https://image.tmdb.org/t/p/w185/edPU5HxncLWa1YkgRPNkSd68ONG.jpg" },
  { name: "Cate Blanchett",     url: "https://image.tmdb.org/t/p/w185/vUuEHiAR0eD3XEJhg2DWIjymUAA.jpg" },
  { name: "Jennifer Lawrence",  url: "https://image.tmdb.org/t/p/w185/mDKMsjOMytyBiy7MHNZTa7gp7wj.jpg" },
  { name: "Emma Stone",         url: "https://image.tmdb.org/t/p/w185/cZ8a3QvAnj2cgcgVL6g4XaqPzpL.jpg" },
  { name: "Margot Robbie",      url: "https://image.tmdb.org/t/p/w185/8LqG2N6j98lFGMpuYsRUAhOunSd.jpg" },
  { name: "Zendaya",            url: "https://image.tmdb.org/t/p/w185/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg" },
  // Bollywood Male
  { name: "Shah Rukh Khan",     url: "https://image.tmdb.org/t/p/w185/gc3Ul6EtVYKgjBuYAaD8U2qIcSl.jpg" },
  { name: "Aamir Khan",         url: "https://image.tmdb.org/t/p/w185/6uiZSwi2kvd1jZ7X7Xz9W9VGuV4.jpg" },
  { name: "Salman Khan",        url: "https://image.tmdb.org/t/p/w185/n7pKtccmf2jVOz8Qn90q2ThqLge.jpg" },
  { name: "Ranbir Kapoor",      url: "https://image.tmdb.org/t/p/w185/ymYNHV9luwgyrw17NXHqbOWTQkg.jpg" },
  { name: "Ranveer Singh",      url: "https://image.tmdb.org/t/p/w185/sRiwLmhduFghJo8U2coUafnDD4C.jpg" },
  { name: "Hrithik Roshan",     url: "https://image.tmdb.org/t/p/w185/5O7WrWe84WDFj7td64NVsobtHf3.jpg" },
  { name: "Akshay Kumar",       url: "https://image.tmdb.org/t/p/w185/sR8nASRtTpiwXqkFHjG2jdRBZ7a.jpg" },
  { name: "Prabhas",            url: "https://image.tmdb.org/t/p/w185/u6RVP8ukgLaymeoi5VmX0JRAcCn.jpg" },
  // Bollywood Female
  { name: "Deepika Padukone",   url: "https://image.tmdb.org/t/p/w185/rzvvBQ0r6oiqDdzcsdTRB7jN4Rx.jpg" },
  { name: "Priyanka Chopra",    url: "https://image.tmdb.org/t/p/w185/9n2n3fUFI553HKH0CEAb2TPLtCx.jpg" },
  { name: "Alia Bhatt",         url: "https://image.tmdb.org/t/p/w185/RBnTJPegPFLBS4VPsNLbf6iAoD.jpg" },
  { name: "Katrina Kaif",       url: "https://image.tmdb.org/t/p/w185/4EAYTJvGdt4NYl2BUKZMdz4lztR.jpg" },
  // Hollywood (extra)
  { name: "Jake Gyllenhaal",    url: "https://image.tmdb.org/t/p/w185/j2Yahha9C0zN5DRaTDzYA7WtdOT.jpg" },
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

            // Skip redirect if user is in edit mode or is a new user
            if (!isEditMode && !res.isNewUser && p.favoriteGenres && p.favoriteGenres.length > 0) {
              window.location.href = "/dashboard";
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
        window.location.href = isEditMode ? "/dashboard/profile" : "/dashboard";
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
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                    {ACTOR_AVATARS.map((a) => (
                      <button
                        key={a.url}
                        type="button"
                        onClick={() => setAvatarUrl(a.url)}
                        className={`w-14 h-14 flex-shrink-0 rounded-full border-2 transition overflow-hidden ${
                          avatarUrl === a.url
                            ? "border-brand-purple shadow-lg shadow-brand-purple/30 scale-110"
                            : "border-transparent hover:border-white/30 hover:scale-105"
                        }`}
                      >
                        <img
                          src={a.url}
                          alt={a.name}
                          title={a.name}
                          className="w-14 h-14 object-cover object-[50%_15%]"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                  {/* Preview selected avatar */}
                  {avatarUrl && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <img src={avatarUrl} alt="Selected" className="w-14 h-14 rounded-full border-2 border-brand-purple object-cover object-[50%_15%]" />
                      <span className="text-xs font-semibold text-slate-300">
                        {ACTOR_AVATARS.find(a => a.url === avatarUrl)?.name || "Selected"}
                      </span>
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
