"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useCineverseAuth } from "@/components/provider";
import {
  MapPin, Globe, Award, Clock, Film, Star, MessageSquare,
  Bookmark, Heart, BarChart2, Edit3, X, Save, Camera,
  ThumbsUp, Repeat2, Search, Plus, Trash2, Check, Trophy,
  PlayCircle, CalendarDays, Sparkles,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { getUserProfile, getUserPosts } from "@/actions/profile";
import { updateProfile, updateTopFavoriteMovies } from "@/actions/user";
import { formatDistanceToNow, format } from "date-fns";
import MovieDNACard from "@/components/ai/MovieDNACard";
import { ACTOR_AVATARS } from "@/lib/avatars";
import UserConnectionsModal from "@/components/profile/UserConnectionsModal";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "/api/tmdb/img?path=/t/p";

const TABS = [
  { id: "cinema",    label: "Cinema",    icon: Film },
  { id: "activity",  label: "Activity",  icon: Clock },
  { id: "posts",     label: "Posts",     icon: MessageSquare },
  { id: "reviews",   label: "Reviews",   icon: Star },
  { id: "liked",     label: "Liked",     icon: Heart },
  { id: "commented", label: "Commented", icon: ThumbsUp },
  { id: "saved",     label: "Saved",     icon: Bookmark },
  { id: "taste",     label: "Taste",     icon: BarChart2 },
];

const BANNERS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400",
  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400",
  "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1400",
];

const GENRES = [
  "Action", "Drama", "Sci-Fi", "Fantasy", "Anime",
  "Thriller", "Comedy", "Romance", "Documentary", "Horror",
];

// ─── Mini post card for liked / commented / saved ─────────────────────────────
function MiniPostCard({ post, extra }: { post: any; extra?: React.ReactNode }) {
  if (!post) return null;
  return (
    <GlassCard hoverGlow={false} className="p-4 border-white/5 bg-slate-900/50 hover:border-white/15 transition-all">
      <div className="flex items-start gap-3">
        <img
          src={post.user?.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white">{post.user?.profile?.username || "Unknown"}</span>
            {extra}
          </div>
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.content}</p>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post._count?.reactions || 0}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post._count?.comments || 0}</span>
            <span className="ml-auto">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Top 5 movie slot card ────────────────────────────────────────────────────
function FavSlot({
  rank,
  movieId,
  movieData,
  onPick,
  onRemove,
  isOwner,
}: {
  rank: number;
  movieId?: string;
  movieData?: any;
  onPick: (rank: number) => void;
  onRemove: (rank: number) => void;
  isOwner: boolean;
}) {
  return (
    <div className="relative group flex flex-col items-center gap-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">#{rank}</span>
      {movieId && movieData ? (
        <div
          className="w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg relative cursor-pointer group-hover:border-brand-purple/50 transition"
          onClick={() => isOwner && onPick(rank)}
        >
          <img
            src={movieData.poster_path ? `${IMG_BASE}/w300${movieData.poster_path}` : "https://via.placeholder.com/300x450/1e293b/64748b?text=No+Poster"}
            alt={movieData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-2">
            <span className="text-[10px] font-bold text-white line-clamp-2">{movieData.title}</span>
          </div>
          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(rank); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => isOwner && onPick(rank)}
          disabled={!isOwner}
          className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-1 text-slate-600 hover:border-brand-purple/40 hover:text-brand-purple transition disabled:cursor-default"
        >
          {isOwner ? <><Plus className="w-6 h-6" /><span className="text-[10px] font-bold">Pick Movie</span></> : <Film className="w-6 h-6 opacity-30" />}
        </button>
      )}
      {movieData && <p className="text-[11px] text-slate-400 font-semibold text-center line-clamp-1 w-full">{movieData.title}</p>}
    </div>
  );
}

// ─── TMDB Movie Search Modal ──────────────────────────────────────────────────
function MoviePickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (movie: any) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/tmdb/proxy?endpoint=${encodeURIComponent("/search/movie")}&query=${encodeURIComponent(query)}&page=1`);
      const data = await res.json();
      setResults(data.results?.slice(0, 8) || []);
      setSearching(false);
    }, 400);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h3 className="text-sm font-bold text-white">Pick a Movie</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-white/5 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for a movie..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {searching && <div className="py-8 flex justify-center"><div className="w-5 h-5 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" /></div>}
          {!searching && results.length === 0 && query && (
            <p className="text-center text-slate-500 text-sm py-8">No results found.</p>
          )}
          {!searching && results.length === 0 && !query && (
            <p className="text-center text-slate-500 text-sm py-8">Start typing to search TMDB...</p>
          )}
          {results.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left group"
            >
              <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-slate-800">
                {m.poster_path
                  ? <img src={`${IMG_BASE}/w92${m.poster_path}`} alt={m.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Film className="w-5 h-5 text-slate-600" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-brand-purple transition truncate">{m.title}</p>
                <p className="text-[10px] text-slate-500">{m.release_date?.slice(0, 4) || "Unknown"} • ⭐ {m.vote_average?.toFixed(1)}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{m.overview}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useCineverseAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cinema");

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [editLanguage, setEditLanguage] = useState("English");
  const [editCountry, setEditCountry] = useState("United States");
  const [editGenres, setEditGenres] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Top 5 favourites
  const [favIds, setFavIds] = useState<(string | undefined)[]>(Array(5).fill(undefined));
  const [favData, setFavData] = useState<Record<string, any>>({});
  const [savingFavs, setSavingFavs] = useState(false);
  const [favSaved, setFavSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(0);
  // Guard so favIds are only seeded from DB on the FIRST load, never overwritten by re-renders
  const favsInitialized = useRef(false);

  // Connections modal
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<"followers" | "following" | "friends" | "requests">("followers");

  // DNA
  const [dnaData, setDnaData] = useState<any | null>(null);
  const [loadingDna, setLoadingDna] = useState(false);

  const loadProfile = useCallback(async () => {
    const res = await getUserProfile();
    if (res.success && res.user) {
      setProfileData(res.user);
      setLoading(false);
      // Only seed favIds from DB on the very first fetch — never overwrite user edits
      if (!favsInitialized.current) {
        const ids: (string | undefined)[] = Array(5).fill(undefined);
        const savedIds: string[] = res.user.profile?.favoriteMovies || [];
        savedIds.forEach((id: string, i: number) => { ids[i] = id; });
        setFavIds(ids);
        favsInitialized.current = true;
      }
    } else {
      window.location.href = "/onboarding";
    }
  }, []);

  useEffect(() => { loadProfile(); }, [user, loadProfile]);

  // Fetch TMDB metadata for each favId
  useEffect(() => {
    favIds.forEach(id => {
      if (id && !favData[id]) {
        fetch(`/api/tmdb/proxy?endpoint=${encodeURIComponent(`/movie/${id}`)}`)
          .then(r => r.json())
          .then(data => setFavData(prev => ({ ...prev, [id]: data })))
          .catch(() => {});
      }
    });
  }, [favIds]);

  // Fetch posts when posts tab active
  useEffect(() => {
    if (activeTab === "posts" && profileData) {
      getUserPosts(profileData.id).then(res => {
        if (res.success && res.posts) setUserPosts(res.posts);
      });
    }
    if (activeTab === "taste" && !dnaData) {
      setLoadingDna(true);
      fetch("/api/ai/profile")
        .then(r => r.json())
        .then(data => { setDnaData(data.dna); setLoadingDna(false); })
        .catch(() => setLoadingDna(false));
    }
  }, [activeTab, profileData?.id]);

  const openEditModal = () => {
    if (!profileData) return;
    const p = profileData.profile || {};
    setEditUsername(p.username || "");
    setEditBio(p.bio || "");
    setEditAvatarUrl(p.avatarUrl || "");
    setEditBannerUrl(p.bannerUrl || "");
    setEditLanguage(p.language || "English");
    setEditCountry(p.country || "United States");
    setEditGenres(p.favoriteGenres || []);
    setSaveError("");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) { setSaveError("Username is required."); return; }
    setIsSaving(true);
    setSaveError("");
    const res = await updateProfile({
      username: editUsername.trim(),
      bio: editBio,
      avatarUrl: editAvatarUrl,
      bannerUrl: editBannerUrl,
      favoriteGenres: editGenres,
      favoriteMovies: profileData?.profile?.favoriteMovies || [],
      favoriteActors: profileData?.profile?.favoriteActors || [],
      favoriteDirectors: profileData?.profile?.favoriteDirectors || [],
      language: editLanguage,
      country: editCountry,
    });
    setIsSaving(false);
    if (res.success) {
      loadProfile();
      setShowEditModal(false);
    } else {
      setSaveError(res.error || "Failed to save.");
    }
  };

  const handlePickMovie = (rank: number) => { setPickerSlot(rank); setShowPicker(true); };
  const handleRemoveFav = (rank: number) => {
    setFavIds(prev => { const next = [...prev]; next[rank - 1] = undefined; return next; });
    setFavSaved(false);
  };
  const handleSelectMovie = (movie: any) => {
    setFavData(prev => ({ ...prev, [String(movie.id)]: movie }));
    setFavIds(prev => { const next = [...prev]; next[pickerSlot - 1] = String(movie.id); return next; });
    setShowPicker(false);
    setFavSaved(false);
  };
  const handleSaveFavs = async () => {
    setSavingFavs(true);
    const ids = favIds.filter(Boolean) as string[];
    await updateTopFavoriteMovies(ids);
    setSavingFavs(false);
    setFavSaved(true);
    setTimeout(() => setFavSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;
  const profile = profileData.profile || {};

  // Derived lists
  const likedPosts = (profileData.reactions || []).map((r: any) => r.post).filter(Boolean);
  const commentedPosts = (profileData.comments || []).map((c: any) => c.post).filter(Boolean);
  const savedPosts = (profileData.bookmarks || []).map((b: any) => b.post).filter(Boolean);
  const diaryEntries: any[] = profileData.diaryEntries || [];
  const recentWatched = diaryEntries.slice(0, 10);

  return (
    <div className="w-full pb-16">

      {/* ─── Banner ──────────────────────────────────────────────────────────── */}
      <div className="h-[180px] md:h-[260px] w-full relative">
        <img
          src={profile.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400"}
          alt="Banner"
          className="w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 space-y-4">

        {/* ─── Avatar row ──────────────────────────────────────────────────── */}
        <div className="flex items-end justify-between -mt-10 md:-mt-14 px-1">
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl || `/api/tmdb/img?path=/t/p/w185/mkdRcVIQl4WZhDf1vXKWTD7HZrZ.jpg`}
              alt={profile.username}
              className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-brand-dark shadow-2xl"
            />
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-brand-dark rounded-full" />
          </div>
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {/* ─── Profile Card ─────────────────────────────────────────────────── */}
        <GlassCard hoverGlow={false} className="p-4 md:p-6 border-white/10 bg-slate-950/90 backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <h1 className="font-display font-extrabold text-xl md:text-2xl text-white tracking-tight">
                {profile.username || "Cinephile"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[10px] font-bold uppercase tracking-wider">
                {profile.reputation || "Bronze Star"}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              {profile.bio || "Cinephile. Explore my reviews and film diary."}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country || "Earth"}</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{profile.language || "English"}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 border-t border-white/5 pt-4 mt-4">
            {[
              { label: "Followers",   value: profileData._count?.followers || 0, tab: "followers" as const },
              { label: "Following",   value: profileData._count?.following  || 0, tab: "following" as const },
              { label: "Friends",     value: null, tab: "friends" as const },
            ].map(stat => (
              <button
                key={stat.label}
                onClick={() => { setConnectionsTab(stat.tab); setConnectionsModalOpen(true); }}
                className="text-center space-y-0.5 rounded-xl py-1 hover:bg-white/5 transition cursor-pointer"
              >
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{stat.label}</span>
                <span className="text-xl font-extrabold text-white">
                  {stat.value !== null ? stat.value : "View"}
                </span>
              </button>
            ))}
            {[
              { label: "Reviews",     value: profileData._count?.reviews    || 0 },
              { label: "Posts",       value: profileData._count?.posts      || 0 },
              { label: "Requests",    value: null, tab: "requests" as const },
            ].map(stat => (
              "tab" in stat ? (
                <button
                  key={stat.label}
                  onClick={() => { setConnectionsTab("requests"); setConnectionsModalOpen(true); }}
                  className="text-center space-y-0.5 rounded-xl py-1 hover:bg-amber-500/5 transition cursor-pointer"
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-500/70 block">{stat.label}</span>
                  <span className="text-xl font-extrabold text-amber-400">View</span>
                </button>
              ) : (
                <div key={stat.label} className="text-center space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{stat.label}</span>
                  <span className="text-xl font-extrabold text-white">{(stat as any).value}</span>
                </div>
              )
            ))}
          </div>
        </GlassCard>

        <UserConnectionsModal
          isOpen={connectionsModalOpen}
          onClose={() => setConnectionsModalOpen(false)}
          targetUserId={profileData.id}
          initialTab={connectionsTab}
          isSelf={true}
        />

        {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border border-brand-purple/30 text-white shadow"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ──────────────────────────────────────────────────── */}
        <div className="space-y-4 min-h-[300px]">

          {/* ══ CINEMA TAB — Top 5 + Recently Watched ══ */}
          {activeTab === "cinema" && (
            <div className="space-y-8">

              {/* Top 5 Favourites */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-brand-gold" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">My Top 5 Favourite Films</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {favSaved && (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold animate-in fade-in duration-300">
                        <Check className="w-3.5 h-3.5" />Saved!
                      </span>
                    )}
                    <button
                      onClick={handleSaveFavs}
                      disabled={savingFavs}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-bold hover:bg-brand-purple/30 transition active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingFavs ? "Saving..." : "Save List"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 md:gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FavSlot
                      key={i}
                      rank={i + 1}
                      movieId={favIds[i]}
                      movieData={favIds[i] ? favData[favIds[i]!] : undefined}
                      onPick={handlePickMovie}
                      onRemove={handleRemoveFav}
                      isOwner={true}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 text-center">Click any slot to search and pick your favourite movie • Changes are saved when you click "Save List"</p>
              </div>

              {/* Recently Watched */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-brand-blue" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recently Watched</h2>
                </div>

                {recentWatched.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {recentWatched.map((entry: any) => (
                      <Link key={entry.id} href={`/dashboard/movies/${entry.movieId}`} className="group block">
                        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-[2/3] shadow-lg group-hover:border-brand-blue/50 transition">
                          {entry.movie?.posterPath ? (
                            <img
                              src={`${IMG_BASE}/w300${entry.movie.posterPath}`}
                              alt={entry.movie?.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                              <Film className="w-8 h-8 text-slate-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p className="text-xs font-bold text-white line-clamp-1">{entry.movie?.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {entry.rating && (
                                <span className="flex items-center gap-0.5 text-[10px] text-brand-gold font-bold">
                                  <Star className="w-2.5 h-2.5 fill-brand-gold" />{entry.rating}/10
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <CalendarDays className="w-2.5 h-2.5" />
                                {format(new Date(entry.watchedAt), "MMM d")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<PlayCircle className="w-10 h-10 text-slate-600" />}
                    message="No movies logged yet. Head to a movie page to log what you've watched."
                  />
                )}
              </div>
            </div>
          )}

          {/* ══ ACTIVITY TAB ══ */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {profileData.activities?.length > 0 ? (
                profileData.activities.map((a: any) => (
                  <GlassCard key={a.id} hoverGlow={false} className="p-4 flex items-start gap-4 border-white/5 bg-slate-900/50">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">{a.description}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <EmptyState icon={<Clock className="w-10 h-10 text-slate-600" />} message="No recent activity yet." />
              )}
            </div>
          )}

          {/* ══ POSTS TAB ══ */}
          {activeTab === "posts" && (
            <div className="space-y-4">
              {userPosts.length > 0 ? (
                userPosts.map((post: any) => (
                  <Link key={post.id} href={`/dashboard/post/${post.id}`} className="group block">
                    <GlassCard hoverGlow={false} className="p-5 border-white/5 bg-slate-900/50 hover:border-white/15 transition-all">
                      <p className="text-sm text-slate-200 group-hover:text-white transition line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                      {post.imageUrl && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-white/10 max-h-40">
                          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post._count?.reactions || 0}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post._count?.comments || 0}</span>
                        <span className="ml-auto">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </GlassCard>
                  </Link>
                ))
              ) : (
                <EmptyState icon={<MessageSquare className="w-10 h-10 text-slate-600" />} message="You haven't posted anything yet. Share your thoughts on the feed." />
              )}
            </div>
          )}

          {/* ══ REVIEWS TAB ══ */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {profileData.reviews?.length > 0 ? (
                profileData.reviews.map((rev: any) => (
                  <Link key={rev.id} href={`/dashboard/movies/${rev.movieId}`} className="group block">
                    <GlassCard hoverGlow={false} className="p-5 border-white/5 bg-slate-900/50 hover:border-brand-blue/30 transition-all">
                      <div className="flex items-start gap-4">
                        {rev.movie?.posterPath && (
                          <img
                            src={`${IMG_BASE}/w92${rev.movie.posterPath}`}
                            alt={rev.movie.title}
                            className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-brand-blue transition">
                              {rev.movie?.title || "Unknown Movie"}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-bold text-amber-400">{rev.rating}/10</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{rev.content}</p>
                          <span className="text-[10px] text-slate-500 mt-2 block">
                            {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))
              ) : (
                <EmptyState icon={<Star className="w-10 h-10 text-slate-600" />} message="No reviews written yet. Head to a movie page to leave a review." />
              )}
            </div>
          )}

          {/* ══ LIKED TAB ══ */}
          {activeTab === "liked" && (
            <div className="space-y-3">
              {likedPosts.length > 0 ? (
                likedPosts.map((post: any, i: number) => (
                  <MiniPostCard
                    key={`liked-${post.id}-${i}`}
                    post={post}
                    extra={
                      <span className="flex items-center gap-1 text-[10px] text-pink-400 font-bold bg-pink-400/10 px-2 py-0.5 rounded-full">
                        <Heart className="w-2.5 h-2.5 fill-pink-400" /> Liked
                      </span>
                    }
                  />
                ))
              ) : (
                <EmptyState icon={<Heart className="w-10 h-10 text-slate-600" />} message="No liked posts yet. React to posts you enjoy!" />
              )}
            </div>
          )}

          {/* ══ COMMENTED TAB ══ */}
          {activeTab === "commented" && (
            <div className="space-y-3">
              {commentedPosts.filter(Boolean).length > 0 ? (
                commentedPosts.filter(Boolean).map((post: any, i: number) => (
                  <MiniPostCard
                    key={`commented-${post.id}-${i}`}
                    post={post}
                    extra={
                      <span className="flex items-center gap-1 text-[10px] text-brand-blue font-bold bg-brand-blue/10 px-2 py-0.5 rounded-full">
                        <MessageSquare className="w-2.5 h-2.5" /> Commented
                      </span>
                    }
                  />
                ))
              ) : (
                <EmptyState icon={<MessageSquare className="w-10 h-10 text-slate-600" />} message="No comments made yet. Join the conversation on posts!" />
              )}
            </div>
          )}

          {/* ══ SAVED TAB ══ */}
          {activeTab === "saved" && (
            <div className="space-y-3">
              {savedPosts.filter(Boolean).length > 0 ? (
                savedPosts.filter(Boolean).map((post: any, i: number) => (
                  <MiniPostCard
                    key={`saved-${post.id}-${i}`}
                    post={post}
                    extra={
                      <span className="flex items-center gap-1 text-[10px] text-brand-gold font-bold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                        <Bookmark className="w-2.5 h-2.5 fill-brand-gold" /> Saved
                      </span>
                    }
                  />
                ))
              ) : (
                <EmptyState icon={<Bookmark className="w-10 h-10 text-slate-600" />} message="No saved posts yet. Bookmark posts to find them here." />
              )}
            </div>
          )}

          {/* ══ TASTE TAB ══ */}
          {activeTab === "taste" && (
            <div className="space-y-6">
              {loadingDna ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 bg-white/2 rounded-2xl border border-white/5">
                  <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-slate-400">Sequencing your cinematic DNA...</p>
                </div>
              ) : dnaData ? (
                <MovieDNACard dna={dnaData} />
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteGenres?.length > 0 ? (
                        profile.favoriteGenres.map((g: string) => (
                          <span key={g} className="px-4 py-2 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-sm font-bold text-brand-purple">
                            {g}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No favorite genres set. Edit your profile.</span>
                      )}
                    </div>
                  </div>
                  {profile.favoriteActors?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite Actors</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.favoriteActors.map((a: string) => (
                          <span key={a} className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-400">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.favoriteDirectors?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite Directors</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.favoriteDirectors.map((d: string) => (
                          <span key={d} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ─── Movie Picker Modal ─────────────────────────────────────────────── */}
      {showPicker && (
        <MoviePickerModal
          onSelect={handleSelectMovie}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* ─── Edit Profile Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-base font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    placeholder="Your username"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Tell the community about yourself..."
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition resize-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5" /> Choose Avatar
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ACTOR_AVATARS.map((a) => (
                    <button
                      key={a.url}
                      type="button"
                      onClick={() => setEditAvatarUrl(a.url)}
                      className={`w-12 h-12 rounded-full border-2 overflow-hidden transition flex-shrink-0 ${
                        editAvatarUrl === a.url
                          ? "border-brand-purple scale-110 shadow-md shadow-brand-purple/40"
                          : "border-transparent hover:border-white/30 hover:scale-105"
                      }`}
                    >
                      <img src={a.url} alt={a.name} title={a.name} className="w-12 h-12 object-cover object-[50%_15%]" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner Image</label>
                <div className="grid grid-cols-5 gap-2">
                  {BANNERS.map(url => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setEditBannerUrl(url)}
                      className={`h-10 rounded-lg overflow-hidden border-2 transition ${
                        editBannerUrl === url
                          ? "border-brand-purple scale-105 shadow-md"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="banner" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language</label>
                  <input
                    type="text"
                    value={editLanguage}
                    onChange={e => setEditLanguage(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-purple/60 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={e => setEditCountry(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-purple/60 transition"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Favorite Genres</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() =>
                        setEditGenres(prev =>
                          prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        editGenres.includes(g)
                          ? "bg-brand-purple/20 border-brand-purple text-white"
                          : "bg-white/3 border-white/5 text-slate-400 hover:border-white/20"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <p className="text-xs text-red-400 font-semibold">{saveError}</p>}
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="py-2 px-5 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="py-2 px-6 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 transition active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-white/5 bg-slate-900/30 rounded-2xl gap-3">
      {icon}
      <p className="text-slate-500 text-sm max-w-xs">{message}</p>
    </div>
  );
}
