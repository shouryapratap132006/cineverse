"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, User, Compass, Star, ChevronRight, ChevronLeft, Check, Search } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { syncUserAccount, updateProfile } from "@/actions/user";
import { getTrendingMovies, Movie } from "@/lib/tmdb";
import { useAuth, useUser } from "@clerk/nextjs";

// Helper to generate a reliable illustrated avatar
const av = (seed: string, bg: string, style = "adventurer") =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`;

const CHARACTER_AVATARS = [
  // Hollywood Heroes & Villains
  { name: "Batman", category: "Hollywood", url: av("batman-dark-knight", "0a0a0a") },
  { name: "Joker", category: "Hollywood", url: av("joker-chaos", "4c1d95") },
  { name: "Superman", category: "Hollywood", url: av("superman-krypton", "1d4ed8") },
  { name: "Iron Man", category: "Hollywood", url: av("ironman-stark", "7f1d1d") },
  { name: "Spider-Man", category: "Hollywood", url: av("spiderman-web", "dc2626") },
  { name: "Thor", category: "Hollywood", url: av("thor-asgard", "1e40af") },
  { name: "Captain America", category: "Hollywood", url: av("captain-america", "1d4ed8") },
  { name: "Black Panther", category: "Hollywood", url: av("black-panther-wakanda", "111827") },
  { name: "Wonder Woman", category: "Hollywood", url: av("wonder-woman-diana", "b45309") },
  { name: "Deadpool", category: "Hollywood", url: av("deadpool-mercenary", "991b1b") },
  { name: "John Wick", category: "Hollywood", url: av("john-wick-baba-yaga", "111827") },
  { name: "Thanos", category: "Hollywood", url: av("thanos-infinity", "312e81") },
  { name: "Harry Potter", category: "Hollywood", url: av("harry-potter-wizard", "7f1d1d") },
  { name: "Hermione", category: "Hollywood", url: av("hermione-granger", "92400e") },
  { name: "Darth Vader", category: "Hollywood", url: av("darth-vader-sith", "0a0a0a") },
  { name: "Luke Skywalker", category: "Hollywood", url: av("luke-skywalker-jedi", "14532d") },
  { name: "Indiana Jones", category: "Hollywood", url: av("indiana-jones-archaeologist", "78350f") },
  { name: "Neo", category: "Hollywood", url: av("neo-matrix-chosen", "064e3b") },
  { name: "Jack Sparrow", category: "Hollywood", url: av("jack-sparrow-pirate", "451a03") },
  { name: "The Mandalorian", category: "Hollywood", url: av("mandalorian-beskar", "1f2937") },
  { name: "Wolverine", category: "Hollywood", url: av("wolverine-mutant-xmen", "78350f") },
  { name: "Hulk", category: "Hollywood", url: av("hulk-banner-gamma", "14532d") },

  // Bollywood
  { name: "Kabir Singh", category: "Bollywood", url: av("kabir-singh-patel", "7f1d1d") },
  { name: "Rancho", category: "Bollywood", url: av("rancho-3-idiots", "047857") },
  { name: "Munna Bhai", category: "Bollywood", url: av("munna-bhai-mbbs", "b45309") },
  { name: "Prem", category: "Bollywood", url: av("prem-ddlj-romance", "4338ca") },
  { name: "Don", category: "Bollywood", url: av("don-bollywood-gangster", "111827") },
  { name: "Pushpa Raj", category: "Bollywood", url: av("pushpa-raj-allu", "78350f") },
  { name: "Rocky (KGF)", category: "Bollywood", url: av("rocky-kgf-yash", "111827") },
  { name: "Baahubali", category: "Bollywood", url: av("baahubali-amarendra", "92400e") },
  { name: "Bajirao", category: "Bollywood", url: av("bajirao-mastani-peshwa", "9a3412") },
  { name: "Chulbul Pandey", category: "Bollywood", url: av("chulbul-pandey-dabangg", "047857") },
  { name: "Gabbar Singh", category: "Bollywood", url: av("gabbar-singh-sholay", "374151") },
  { name: "Mogambo", category: "Bollywood", url: av("mogambo-mrgm", "312e81") },

  // Anime — pixel-art style for that anime feel
  { name: "Monkey D. Luffy", category: "Anime", url: av("luffy-onepiece-straw-hat", "991b1b", "pixel-art") },
  { name: "Naruto Uzumaki", category: "Anime", url: av("naruto-uzumaki-konoha", "b45309", "pixel-art") },
  { name: "Gojo Satoru", category: "Anime", url: av("gojo-satoru-jjk", "1e40af", "pixel-art") },
  { name: "Levi Ackerman", category: "Anime", url: av("levi-ackerman-aot", "064e3b", "pixel-art") },
  { name: "Itachi Uchiha", category: "Anime", url: av("itachi-uchiha-sharingan", "0a0a0a", "pixel-art") },
  { name: "Light Yagami", category: "Anime", url: av("light-yagami-deathnote", "1f2937", "pixel-art") },
  { name: "Tanjiro Kamado", category: "Anime", url: av("tanjiro-demon-slayer", "047857", "pixel-art") },
  { name: "Eren Yeager", category: "Anime", url: av("eren-yeager-titan", "451a03", "pixel-art") },
  { name: "Saitama", category: "Anime", url: av("saitama-one-punch-man", "1d4ed8", "pixel-art") },
  { name: "Zoro", category: "Anime", url: av("roronoa-zoro-swordsman", "14532d", "pixel-art") },
  { name: "Sukuna", category: "Anime", url: av("sukuna-ryomen-cursed", "7f1d1d", "pixel-art") },
  { name: "All Might", category: "Anime", url: av("all-might-symbol-peace", "1d4ed8", "pixel-art") },
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

  const filteredAvatars = CHARACTER_AVATARS.filter(c => {
    const q = avatarSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

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
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">Choose Character Avatar</label>
                    {/* Category filter pills */}
                    <div className="flex gap-1.5">
                      {["All", "Hollywood", "Bollywood", "Anime"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAvatarSearch(cat === "All" ? "" : cat)}
                          className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition ${
                            (cat === "All" && !avatarSearch) || avatarSearch.toLowerCase() === cat.toLowerCase()
                              ? "bg-brand-purple/20 border-brand-purple text-brand-purple"
                              : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-52 overflow-y-auto scrollbar-thin pr-1">
                    {filteredAvatars.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setAvatarUrl(c.url)}
                        className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition group ${
                          avatarUrl === c.url
                            ? "border-brand-purple bg-brand-purple/10 shadow-lg shadow-brand-purple/20"
                            : "border-transparent hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-slate-800 group-hover:border-brand-purple/40 transition">
                          <img
                            src={c.url}
                            alt={c.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to DiceBear if the SVG fails for some reason
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=1e293b`;
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-center text-slate-400 group-hover:text-white transition leading-tight line-clamp-2 w-full px-0.5">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Preview selected avatar */}
                  {avatarUrl && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <img src={avatarUrl} alt="Selected" className="w-10 h-10 rounded-full border-2 border-brand-purple object-cover" />
                      <span className="text-xs font-bold text-white">
                        {CHARACTER_AVATARS.find(c => c.url === avatarUrl)?.name || "Selected Avatar"}
                      </span>
                      <span className="ml-auto text-[9px] text-slate-500 font-semibold">
                        {CHARACTER_AVATARS.find(c => c.url === avatarUrl)?.category}
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
