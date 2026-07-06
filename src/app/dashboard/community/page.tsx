"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Globe, Users, Plus, Search, Shield, Flame, Calendar, Film,
  Star, ChevronRight, X, Clock, Clapperboard, UserPlus, Check,
  Crown, BookOpen, Sparkles, TrendingUp, Zap, Heart,
  MessageSquare, Grid3x3, List, Filter, SortAsc, Play, Music,
} from "lucide-react";
import {
  createCommunity, getCommunities, getUpcomingEvents, getFilmClubs,
  createFilmClub, joinFilmClub, joinCommunity,
} from "@/actions/community";
import { formatDistanceToNow } from "date-fns";

// ─── Featured communities with cinematic banners ──────────────────────────────
const FEATURED = [
  {
    name: "Sci-Fi Enthusiasts",
    description: "Explore the cosmos through cinema. Hard sci-fi, space opera, cyberpunk — all welcome.",
    slug: "sci-fi-enthusiasts",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    gradient: "from-sky-900/80 via-indigo-900/60 to-transparent",
    tag: "Genre",
    tagColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    members: "24.1K",
  },
  {
    name: "Nolanverse",
    description: "For those who believe Christopher Nolan hasn't made a bad film. Mind-bending discussions.",
    slug: "nolanverse",
    banner: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200",
    gradient: "from-slate-900/80 via-zinc-900/60 to-transparent",
    tag: "Director",
    tagColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    members: "18.7K",
  },
  {
    name: "A24 Fanatics",
    description: "Prestige cinema meets cult obsession. Midsommar to Everything Everywhere.",
    slug: "a24-fanatics",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200",
    gradient: "from-rose-900/80 via-pink-900/60 to-transparent",
    tag: "Studio",
    tagColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    members: "31.4K",
  },
  {
    name: "Bollywood Blockbusters",
    description: "RRR, KGF, Baahubali and beyond. Celebrating the grandeur of Indian cinema.",
    slug: "bollywood-blockbusters",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    gradient: "from-orange-900/80 via-amber-900/60 to-transparent",
    tag: "Regional",
    tagColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    members: "42.8K",
  },
  {
    name: "Horror Freaks",
    description: "From Ari Aster to James Wan. We love being scared. No jump scare slander.",
    slug: "horror-freaks",
    banner: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200",
    gradient: "from-red-950/90 via-slate-900/60 to-transparent",
    tag: "Genre",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
    members: "15.2K",
  },
];

const GENRE_TAGS = [
  { label: "All", icon: <Globe className="w-3.5 h-3.5" /> },
  { label: "Action", icon: <Zap className="w-3.5 h-3.5" /> },
  { label: "Sci-Fi", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { label: "Horror", icon: <Flame className="w-3.5 h-3.5" /> },
  { label: "Drama", icon: <Heart className="w-3.5 h-3.5" /> },
  { label: "Director", icon: <Clapperboard className="w-3.5 h-3.5" /> },
  { label: "Studio", icon: <Film className="w-3.5 h-3.5" /> },
  { label: "Music", icon: <Music className="w-3.5 h-3.5" /> },
  { label: "Anime", icon: <Play className="w-3.5 h-3.5" /> },
];

const TABS = [
  { id: "discover", label: "Discover", icon: Globe },
  { id: "joined", label: "Joined", icon: Check },
  { id: "events", label: "Events", icon: Calendar },
  { id: "clubs", label: "Film Clubs", icon: BookOpen },
];

export default function CommunityHubPage() {
  const [activeTab, setActiveTab] = useState("discover");
  const [activeGenre, setActiveGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [communityView, setCommunityView] = useState<"grid" | "list">("grid");

  const [dbCommunities, setDbCommunities] = useState<any[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filmClubs, setFilmClubs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", slug: "", description: "", type: "USER_CREATED" });
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const heroRef = useRef<NodeJS.Timeout>();

  // Auto-cycle featured hero
  useEffect(() => {
    heroRef.current = setInterval(() => {
      setFeaturedIndex(i => (i + 1) % FEATURED.length);
    }, 5000);
    return () => clearInterval(heroRef.current);
  }, []);

  useEffect(() => {
    Promise.all([
      getCommunities("all"),
      getCommunities("joined"),
      getUpcomingEvents(),
      getFilmClubs(),
    ]).then(([all, joined, evRes, clubs]) => {
      if (all.success) setDbCommunities(all.communities || []);
      if (joined.success) setJoinedCommunities(joined.communities || []);
      if (evRes.success) setEvents(evRes.events || []);
      if (clubs.success) setFilmClubs(clubs.clubs || []);
      setLoadingData(false);
    });
  }, []);

  const handleJoin = async (communityId: string) => {
    const res = await joinCommunity(communityId);
    if (res.success) {
      getCommunities("all").then(r => { if (r.success) setDbCommunities(r.communities || []); });
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name || !newCommunity.slug || !newCommunity.description || creatingCommunity) return;
    setCreatingCommunity(true);
    const res = await createCommunity(newCommunity);
    if (res.success) {
      setShowCreateModal(false);
      setNewCommunity({ name: "", slug: "", description: "", type: "USER_CREATED" });
      getCommunities("all").then(r => { if (r.success) setDbCommunities(r.communities || []); });
    }
    setCreatingCommunity(false);
  };

  const handleJoinClub = async (clubId: string) => {
    await joinFilmClub(clubId);
    getFilmClubs().then(r => { if (r.success) setFilmClubs(r.clubs || []); });
  };

  // Filter + merge communities (db + featured)
  const allCommunities = [
    ...FEATURED.map(f => ({ ...f, isStatic: true })),
    ...dbCommunities.filter(c => !FEATURED.some(f => f.slug === c.slug)),
  ].filter(c => {
    if (activeGenre !== "All") {
      const type = (c as any).type || (c as any).tag || "";
      if (!type.toLowerCase().includes(activeGenre.toLowerCase()) && !(c.name || "").toLowerCase().includes(activeGenre.toLowerCase())) {
        return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      return (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  const currentFeatured = FEATURED[featuredIndex];

  return (
    <div className="w-full min-h-screen xl:pr-[340px] pb-20">

      {/* ═══ HERO CAROUSEL ═══ */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {FEATURED.map((f, i) => (
          <div
            key={f.slug}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === featuredIndex ? "opacity-100" : "opacity-0"}`}
          >
            <img src={f.banner} alt={f.name} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${f.gradient}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
          </div>
        ))}

        {/* Ambient glow */}
        <div className="absolute top-8 left-24 w-80 h-80 rounded-full bg-brand-purple/20 blur-[100px] pointer-events-none" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-8">
          <div className="max-w-2xl">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border mb-3 ${currentFeatured.tagColor}`}>
              {currentFeatured.tag}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">{currentFeatured.name}</h1>
            <p className="text-slate-300 text-sm mt-2 max-w-lg line-clamp-2">{currentFeatured.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                href={`/dashboard/community/${currentFeatured.slug}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold hover:opacity-90 transition active:scale-95 shadow-lg shadow-brand-purple/30"
              >
                <Users className="w-4 h-4" />
                Explore Community
              </Link>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />{currentFeatured.members} members
              </span>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
          {FEATURED.map((_, i) => (
            <button
              key={i}
              onClick={() => setFeaturedIndex(i)}
              className={`rounded-full transition-all ${i === featuredIndex ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ═══ TOP BAR ═══ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search communities, genres, directors..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/8 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition backdrop-blur-md"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold hover:opacity-90 transition active:scale-95 shadow-lg shadow-brand-purple/20"
            >
              <Plus className="w-4 h-4" />Create Community
            </button>
            <button onClick={() => setCommunityView(v => v === "grid" ? "list" : "grid")} className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition">
              {communityView === "grid" ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ═══ TABS ═══ */}
        <div className="flex items-center gap-1 bg-slate-900/40 border border-white/5 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border border-brand-purple/30 text-white shadow"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══ DISCOVER TAB ═══ */}
        {activeTab === "discover" && (
          <div className="space-y-6">
            {/* Genre filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {GENRE_TAGS.map(g => (
                <button
                  key={g.label}
                  onClick={() => setActiveGenre(g.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all ${
                    activeGenre === g.label
                      ? "bg-brand-purple/20 border-brand-purple text-brand-purple"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {g.icon}{g.label}
                </button>
              ))}
            </div>

            {/* Communities grid/list */}
            {communityView === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allCommunities.map((c: any, i: number) => (
                  <CommunityCard key={c.slug || c.id || i} community={c} onJoin={() => handleJoin(c.id)} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {allCommunities.map((c: any, i: number) => (
                  <CommunityListItem key={c.slug || c.id || i} community={c} onJoin={() => handleJoin(c.id)} />
                ))}
              </div>
            )}

            {allCommunities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Globe className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No communities found</h3>
                <p className="text-sm text-slate-500">Try a different filter or create your own.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ JOINED TAB ═══ */}
        {activeTab === "joined" && (
          <div className="space-y-4">
            {joinedCommunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 border border-white/5 rounded-2xl">
                <Users className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No communities joined</h3>
                <p className="text-sm text-slate-500 mb-5">Find communities that match your interests.</p>
                <button onClick={() => setActiveTab("discover")} className="px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-bold hover:opacity-90 transition">
                  Discover Communities
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {joinedCommunities.map((c: any) => (
                  <CommunityCard key={c.id} community={c} onJoin={() => {}} joined />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ EVENTS TAB ═══ */}
        {activeTab === "events" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Upcoming Events Across Communities</h2>
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 border border-white/5 rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No upcoming events</h3>
                <p className="text-sm text-slate-500">Join communities and check back soon.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {events.map((ev: any) => (
                  <Link key={ev.id} href={`/dashboard/community/${ev.community?.slug}`} className="block group">
                    <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-brand-purple/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex flex-col items-center justify-center text-center shrink-0">
                          <span className="text-[9px] font-bold text-brand-purple uppercase">
                            {new Date(ev.date).toLocaleString("en", { month: "short" })}
                          </span>
                          <span className="text-lg font-extrabold text-white leading-none">
                            {new Date(ev.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-brand-purple transition">{ev.title}</h3>
                          {ev.movieTitle && (
                            <span className="text-[10px] text-brand-blue flex items-center gap-1 mt-0.5">
                              <Film className="w-3 h-3" />{ev.movieTitle}
                            </span>
                          )}
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ev.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev._count?.rsvps || 0} attending</span>
                            <span>in <strong className="text-slate-300">{ev.community?.name}</strong></span>
                            <span className="ml-auto text-brand-blue">
                              {new Date(ev.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ FILM CLUBS TAB ═══ */}
        {activeTab === "clubs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Film Clubs</h2>
              <button
                onClick={async () => {
                  const name = prompt("Film club name:");
                  if (!name) return;
                  const desc = prompt("Description (optional):");
                  await createFilmClub({ name, description: desc || undefined });
                  getFilmClubs().then(r => { if (r.success) setFilmClubs(r.clubs || []); });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-bold hover:bg-brand-purple/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />Create Club
              </button>
            </div>

            {filmClubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 border border-white/5 rounded-2xl">
                <BookOpen className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No film clubs yet</h3>
                <p className="text-sm text-slate-500">Create the first film club on CineVerse.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filmClubs.map((club: any) => {
                  const isJoined = club.members && club.members.length > 0;
                  return (
                    <div key={club.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-brand-blue/30 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-brand-blue" />
                        </div>
                        {isJoined && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Joined</span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{club.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{club.description || "A film club on CineVerse."}</p>
                      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{club._count?.members || 0} members</span>
                        <span className="flex items-center gap-1"><Film className="w-3 h-3" />{club._count?.watchlist || 0} films</span>
                      </div>
                      {!isJoined && (
                        <button onClick={() => handleJoinClub(club.id)} className="mt-3 w-full py-2 rounded-xl border border-brand-blue/30 text-brand-blue text-xs font-bold hover:bg-brand-blue/10 transition">
                          Join Club
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ CREATE COMMUNITY MODAL ═══ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Create a Community</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Build your cinematic corner of CineVerse</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCommunity} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Community Name</label>
                <input
                  required
                  value={newCommunity.name}
                  onChange={e => setNewCommunity(p => ({
                    ...p,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  }))}
                  placeholder="e.g. Cult Classic Cinema"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">URL Slug</label>
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-brand-purple/60 transition">
                  <span className="px-3 text-xs text-slate-500 border-r border-white/10 py-2.5 bg-white/5">/community/</span>
                  <input
                    required
                    value={newCommunity.slug}
                    onChange={e => setNewCommunity(p => ({ ...p, slug: e.target.value }))}
                    placeholder="cult-classic-cinema"
                    className="flex-1 py-2.5 px-3 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newCommunity.description}
                  onChange={e => setNewCommunity(p => ({ ...p, description: e.target.value }))}
                  placeholder="What is this community about? Who should join?"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                <select
                  value={newCommunity.type}
                  onChange={e => setNewCommunity(p => ({ ...p, type: e.target.value }))}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none"
                >
                  <option value="USER_CREATED">General</option>
                  <option value="GENRE">Genre</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="STUDIO">Studio</option>
                  <option value="ACTOR">Actor</option>
                  <option value="MOVIE">Movie</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition">
                  Cancel
                </button>
                <button type="submit" disabled={creatingCommunity} className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-50">
                  {creatingCommunity ? "Creating..." : "Create Community"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Community Card Component ─────────────────────────────────────────────────
function CommunityCard({ community, onJoin, joined }: { community: any; onJoin: () => void; joined?: boolean }) {
  const isJoined = joined || (community.members && community.members.length > 0);
  const memberCount = community.members !== undefined
    ? (typeof community.members === "string" ? community.members : community._count?.members?.toLocaleString())
    : community.members;

  return (
    <div className="group relative bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden hover:border-brand-purple/30 transition-all hover:shadow-xl hover:shadow-brand-purple/10 hover:-translate-y-0.5">
      {/* Banner */}
      <div className="h-28 relative overflow-hidden">
        <img
          src={community.banner || community.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600"}
          alt={community.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        {community.tag && (
          <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold border ${community.tagColor || "bg-white/10 border-white/20 text-white"}`}>
            {community.tag || community.type}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-white">{community.name}</h3>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{community.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Users className="w-3 h-3" />
            <span>{memberCount || community._count?.members || "—"} members</span>
          </div>

          {community.isStatic ? (
            <Link
              href={`/dashboard/community/${community.slug}`}
              className="px-3 py-1.5 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-bold hover:bg-brand-purple/30 transition"
            >
              Explore →
            </Link>
          ) : isJoined ? (
            <Link
              href={`/dashboard/community/${community.slug}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500/20 transition"
            >
              <Check className="w-3 h-3 inline mr-1" />Joined
            </Link>
          ) : (
            <button
              onClick={onJoin}
              className="px-3 py-1.5 rounded-lg bg-brand-purple text-white text-[10px] font-bold hover:opacity-90 transition active:scale-95"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Community List Item Component ────────────────────────────────────────────
function CommunityListItem({ community, onJoin, joined }: { community: any; onJoin: () => void; joined?: boolean }) {
  const isJoined = joined || (community.members && community.members.length > 0);

  return (
    <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-4 flex items-center gap-4 hover:border-brand-purple/30 transition-all">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
        <img
          src={community.banner || community.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200"}
          alt={community.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white">{community.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{community.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{community._count?.members || community.members || "—"} members</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{community._count?.communityPosts || "—"} posts</span>
        </div>
      </div>
      <div className="shrink-0">
        {community.isStatic ? (
          <Link href={`/dashboard/community/${community.slug}`} className="px-4 py-2 rounded-xl bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-bold hover:bg-brand-purple/30 transition">
            View →
          </Link>
        ) : isJoined ? (
          <Link href={`/dashboard/community/${community.slug}`} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition">
            Joined
          </Link>
        ) : (
          <button onClick={onJoin} className="px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold hover:opacity-90 transition active:scale-95">
            Join
          </button>
        )}
      </div>
    </div>
  );
}
