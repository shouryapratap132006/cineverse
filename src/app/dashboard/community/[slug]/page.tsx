"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow, format, isPast, differenceInHours, differenceInMinutes, differenceInDays } from "date-fns";
import {
  Users, MessageSquare, Star, Calendar, Globe, Shield,
  Bell, Share2, ChevronRight, Flame, Trophy, Crown, Medal,
  Plus, X, Check, LogOut, Film, BarChart2, Bookmark,
  Heart, Send, ImageIcon, EyeOff, Search, Grid3x3, List,
  Sparkles, Zap, Target, TrendingUp, Clock, Hash, MapPin,
  Play, Volume2, Award, ChevronDown, MoreHorizontal, Repeat2,
} from "lucide-react";
import {
  getCommunity, joinCommunity, leaveCommunity,
  createCommunityPost, createEvent, rsvpEvent,
  getUpcomingEvents, getCommunityMembers, getCommunityLeaderboard,
  getCommunityReviews,
} from "@/actions/community";
import { toggleReaction, toggleBookmark, createComment } from "@/actions/social";
import PostCard from "@/components/social/PostCard";
import { DEFAULT_AVATAR } from "@/lib/avatars";

// ─── Types ───────────────────────────────────────────────────────────────────
type Tab = "posts" | "reviews" | "events" | "members" | "about";
type MemberSort = "newest" | "oldest" | "role";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
  );
}

function roleColor(role: string) {
  if (role === "OWNER") return "text-amber-400 bg-amber-400/10 border-amber-400/30";
  if (role === "ADMIN") return "text-red-400 bg-red-400/10 border-red-400/30";
  if (role === "MODERATOR") return "text-brand-blue bg-brand-blue/10 border-brand-blue/30";
  if (role === "VERIFIED_CREATOR") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
  return "text-slate-400 bg-white/5 border-white/10";
}

function roleIcon(role: string) {
  if (role === "OWNER") return <Crown className="w-3 h-3" />;
  if (role === "ADMIN") return <Shield className="w-3 h-3" />;
  if (role === "MODERATOR") return <Shield className="w-3 h-3" />;
  return null;
}

function Countdown({ date }: { date: Date }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);
  const days = differenceInDays(date, new Date());
  const hours = differenceInHours(date, new Date()) % 24;
  const minutes = differenceInMinutes(date, new Date()) % 60;
  if (isPast(date)) return <span className="text-slate-500 text-xs">Ended</span>;
  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      {days > 0 && <span className="px-1.5 py-0.5 rounded bg-brand-purple/20 text-brand-purple">{days}d</span>}
      <span className="px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-blue">{hours}h</span>
      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{minutes}m</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommunityDetailPage() {
  const { slug } = useParams() as { slug: string };

  // Core data
  const [community, setCommunity] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("posts");

  // Posts
  const [posts, setPosts] = useState<any[]>([]);

  // Events
  const [events, setEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", movieTitle: "" });
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Members
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberSort, setMemberSort] = useState<MemberSort>("newest");
  const [memberView, setMemberView] = useState<"grid" | "list">("grid");
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Post composer
  const [composerContent, setComposerContent] = useState("");
  const [composerImage, setComposerImage] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [spoilerTag, setSpoilerTag] = useState(false);
  const composerFileRef = useRef<HTMLInputElement>(null);

  // Join/leave
  const [actionLoading, setActionLoading] = useState(false);

  // AI Community Features
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSuggested, setAiSuggested] = useState<any>(null);

  // ─── Load community ───────────────────────────────────────────────────────
  const loadCommunity = useCallback(async () => {
    const res = await getCommunity(slug);
    if (res.success && res.community) {
      setCommunity(res.community);
      setIsMember(res.isMember || false);
      setUserRole(res.userRole || null);
      const rawPosts = (res.community.communityPosts || []).map((cp: any) => cp.post);
      setPosts(rawPosts);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { loadCommunity(); }, [loadCommunity]);

  // ─── Load tab-specific data ───────────────────────────────────────────────
  useEffect(() => {
    if (!community?.id) return;
    if (activeTab === "events") {
      getUpcomingEvents(community.id).then(res => {
        if (res.success && res.events) setEvents(res.events);
      });
    }
    if (activeTab === "members") {
      setLoadingMembers(true);
      getCommunityMembers(community.id, memberSort).then(res => {
        if (res.success && res.members) setMembers(res.members);
        setLoadingMembers(false);
      });
    }
    if (activeTab === "reviews") {
      setLoadingReviews(true);
      getCommunityReviews(community.id).then(res => {
        if (res.success) setReviews(res.reviews || []);
        setLoadingReviews(false);
      });
    }
  }, [activeTab, community?.id]);

  // Leaderboard loads always
  useEffect(() => {
    if (!community?.id) return;
    getCommunityLeaderboard(community.id).then(res => {
      if (res.success && res.leaderboard) setLeaderboard(res.leaderboard);
    });
  }, [community?.id]);

  // Re-fetch members when sort changes
  useEffect(() => {
    if (activeTab === "members" && community?.id) {
      setLoadingMembers(true);
      getCommunityMembers(community.id, memberSort).then(res => {
        if (res.success && res.members) setMembers(res.members);
        setLoadingMembers(false);
      });
    }
  }, [memberSort]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleJoinToggle = async () => {
    if (!community || actionLoading) return;
    setActionLoading(true);
    if (isMember) {
      const res = await leaveCommunity(community.id);
      if (res.success) { setIsMember(false); setUserRole(null); loadCommunity(); }
    } else {
      const res = await joinCommunity(community.id);
      if (res.success) { setIsMember(true); setUserRole("MEMBER"); loadCommunity(); }
    }
    setActionLoading(false);
  };

  const handleComposerImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 800;
        let w = img.width, h = img.height;
        if (w > max) { h = h * max / w; w = max; }
        if (h > max) { w = w * max / h; h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setComposerImage(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPost = async () => {
    if ((!composerContent.trim() && !composerImage) || submittingPost || !community) return;
    setSubmittingPost(true);
    const res = await createCommunityPost(community.id, composerContent.trim(), composerImage || undefined);
    if (res.success) {
      setComposerContent("");
      setComposerImage(null);
      setSpoilerTag(false);
      loadCommunity();
    }
    setSubmittingPost(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !newEvent.title || !newEvent.date || creatingEvent) return;
    setCreatingEvent(true);
    const res = await createEvent({
      communityId: community.id,
      title: newEvent.title,
      description: newEvent.description,
      eventDate: new Date(newEvent.date),
      movieTitle: newEvent.movieTitle || undefined,
    });
    if (res.success) {
      setShowEventModal(false);
      setNewEvent({ title: "", description: "", date: "", movieTitle: "" });
      getUpcomingEvents(community.id).then(r => { if (r.success && r.events) setEvents(r.events); });
    }
    setCreatingEvent(false);
  };

  const handleRSVP = async (eventId: string, status: "GOING" | "INTERESTED" | "NOT_GOING") => {
    await rsvpEvent(eventId, status);
    if (community?.id) {
      getUpcomingEvents(community.id).then(r => { if (r.success && r.events) setEvents(r.events); });
    }
  };

  const handleCommunityAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiSearching(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: `This is the "${community?.name}" film community. ${community?.description || ""}`,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setAiResponse(
          `🎬 **${data.tmdb?.title || data.movieTitle}** (${data.movieYear})\n\n${data.response}`
        );
        // Also store tmdb data for a link/poster
        setAiSuggested(data.tmdb ? {
          id: data.tmdb.id,
          title: data.tmdb.title,
          posterPath: data.tmdb.posterPath,
          rating: data.tmdb.rating,
          tags: data.tags || [],
        } : null);
      } else {
        setAiResponse(data.error || "Something went wrong. Please try again.");
        setAiSuggested(null);
      }
    } catch {
      setAiResponse("Could not reach AI companion. Check your connection.");
      setAiSuggested(null);
    } finally {
      setAiSearching(false);
    }
  };

  // ─── Filtered members ────────────────────────────────────────────────────
  const filteredMembers = members.filter(m => {
    if (!memberSearch) return true;
    const name = m.user?.profile?.username || m.user?.email || "";
    return name.toLowerCase().includes(memberSearch.toLowerCase());
  });

  // ─── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-72 w-full rounded-none" />
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Community not found</h2>
        <p className="text-slate-500 text-sm mb-6">This community doesn't exist or was removed.</p>
        <Link href="/dashboard/community" className="px-5 py-2.5 rounded-xl bg-brand-purple text-white text-sm font-bold hover:opacity-90 transition">
          Browse Communities
        </Link>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "posts", label: "Posts", icon: <MessageSquare className="w-4 h-4" />, count: community._count?.communityPosts },
    { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
    { id: "events", label: "Events", icon: <Calendar className="w-4 h-4" />, count: community._count?.communityEvents },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" />, count: community._count?.members },
    { id: "about", label: "About", icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full min-h-screen">

      {/* ═══════════ HERO ═══════════ */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {/* Banner */}
        <img
          src={community.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600"}
          alt={community.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-transparent to-transparent" />

        {/* Floating glow orbs */}
        <div className="absolute top-8 left-[20%] w-64 h-64 rounded-full bg-brand-purple/20 blur-[80px] pointer-events-none" />
        <div className="absolute top-4 right-[20%] w-48 h-48 rounded-full bg-brand-blue/20 blur-[80px] pointer-events-none" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6">
          <div className="flex items-end gap-4">
            {/* Community Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-slate-900 shadow-2xl shadow-brand-purple/30">
                {community.avatarUrl ? (
                  <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-purple/30 to-brand-blue/30">
                    <Film className="w-8 h-8 text-white/60" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-brand-dark" />
            </div>

            {/* Community Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{community.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                  {community.type?.replace("_", " ")}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1 line-clamp-2 max-w-2xl">{community.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-brand-blue" />
                  <strong className="text-white">{community._count?.members?.toLocaleString()}</strong> members
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />
                  <strong className="text-white">{community._count?.communityPosts?.toLocaleString()}</strong> posts
                </span>
                <span className="hidden md:flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Created {formatDistanceToNow(new Date(community.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="hidden md:flex items-center gap-2 py-2 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white hover:bg-white/10 transition active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={handleJoinToggle}
                disabled={actionLoading}
                className={`flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 ${
                  isMember
                    ? "bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
                    : "bg-gradient-to-r from-brand-blue to-brand-purple text-white shadow-lg shadow-brand-purple/30 hover:opacity-90"
                }`}
              >
                {isMember ? <><LogOut className="w-4 h-4" />Leave</> : <><Plus className="w-4 h-4" />Join</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ TAB NAV ═══════════ */}
      <div className="sticky top-0 z-20 bg-brand-dark/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-brand-purple text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? "bg-brand-purple/20 text-brand-purple" : "bg-white/5 text-slate-500"
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── CENTER FEED ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── POSTS TAB ── */}
            {activeTab === "posts" && (
              <div className="space-y-4">
                {/* Composer */}
                {isMember && (
                  <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 backdrop-blur-md">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-purple/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-brand-purple" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={composerContent}
                          onChange={e => setComposerContent(e.target.value)}
                          placeholder={`Share something with ${community.name}...`}
                          rows={3}
                          className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-sm leading-relaxed"
                        />
                        {composerImage && (
                          <div className="relative w-full max-h-48 rounded-xl overflow-hidden border border-white/10">
                            <img src={composerImage} alt="attachment" className="w-full max-h-48 object-contain" />
                            <button onClick={() => setComposerImage(null)} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                          <div className="flex gap-1">
                            <input type="file" ref={composerFileRef} onChange={handleComposerImage} accept="image/*" className="hidden" />
                            <button onClick={() => composerFileRef.current?.click()} className="p-2 rounded-lg text-brand-blue hover:bg-brand-blue/10 transition" title="Attach image">
                              <ImageIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSpoilerTag(s => !s)} className={`p-2 rounded-lg transition ${spoilerTag ? "text-red-400 bg-red-400/10" : "text-slate-500 hover:bg-white/5"}`} title="Spoiler">
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-600">{composerContent.length}/500</span>
                            <button
                              onClick={handleSubmitPost}
                              disabled={(!composerContent.trim() && !composerImage) || submittingPost}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-40"
                            >
                              {submittingPost ? "Posting..." : <><Send className="w-3.5 h-3.5" />Post</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Posts list */}
                {posts.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare className="w-12 h-12 text-slate-700" />}
                    title="No posts yet"
                    desc={isMember ? "Be the first to post in this community." : "Join this community to start posting."}
                  />
                ) : (
                  posts.map((post: any) => (
                    <PostCard key={post.id} post={post} onUpdate={loadCommunity} />
                  ))
                )}
              </div>
            )}

            {/* ── REVIEWS TAB ── */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {loadingReviews ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))
                ) : reviews.length === 0 ? (
                  <EmptyState
                    icon={<Star className="w-12 h-12 text-slate-700" />}
                    title="No reviews yet"
                    desc="Community members haven't shared any movie reviews yet."
                  />
                ) : (
                  reviews.map((rev: any) => (
                    <Link key={rev.id} href={`/dashboard/movies/${rev.movieId}`} className="block group">
                      <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-brand-blue/30 transition-all">
                        <div className="flex items-start gap-4">
                          {rev.movie?.posterPath && (
                            <img
                              src={`/api/tmdb/img?path=/t/p/w92${rev.movie.posterPath}`}
                              alt={rev.movie.title}
                              className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={rev.user?.profile?.avatarUrl || DEFAULT_AVATAR}
                                  alt=""
                                  className="w-7 h-7 rounded-full border border-white/10 shrink-0 object-cover"
                                />
                                <span className="text-xs font-bold text-slate-300">{rev.user?.profile?.username}</span>
                                <span className="text-slate-600 text-xs">reviewed</span>
                                <span className="text-xs font-bold text-white truncate">{rev.movie?.title}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-bold text-amber-400">{rev.rating}/10</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 mt-2 line-clamp-3 leading-relaxed">{rev.content}</p>
                            <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{rev._count?.likes || 0}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{rev._count?.comments || 0}</span>
                              <span className="ml-auto">{formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* ── EVENTS TAB ── */}
            {activeTab === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Upcoming Events</h2>
                  {isMember && (
                    <button onClick={() => setShowEventModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold hover:opacity-90 transition active:scale-95">
                      <Plus className="w-3.5 h-3.5" />Create Event
                    </button>
                  )}
                </div>

                {events.length === 0 ? (
                  <EmptyState
                    icon={<Calendar className="w-12 h-12 text-slate-700" />}
                    title="No upcoming events"
                    desc="Be the first to create an event for this community."
                  />
                ) : (
                  <div className="space-y-3">
                    {events.map((ev: any) => (
                      <div key={ev.id} className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 hover:border-brand-purple/30 transition-all">
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-14 h-14 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold text-brand-purple uppercase">{format(new Date(ev.date), "MMM")}</span>
                            <span className="text-lg font-extrabold text-white leading-none">{format(new Date(ev.date), "d")}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-sm font-bold text-white">{ev.title}</h3>
                                {ev.movieTitle && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-brand-blue mt-0.5">
                                    <Film className="w-3 h-3" />{ev.movieTitle}
                                  </span>
                                )}
                              </div>
                              <Countdown date={new Date(ev.date)} />
                            </div>
                            {ev.description && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{ev.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Users className="w-3 h-3" />
                                <span>{ev._count?.rsvps || 0} going</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                {format(new Date(ev.date), "h:mm a")}
                              </div>
                              {isMember && (
                                <div className="ml-auto flex items-center gap-1">
                                  {(["GOING", "INTERESTED"] as const).map(status => (
                                    <button
                                      key={status}
                                      onClick={() => handleRSVP(ev.id, status)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                        status === "GOING"
                                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                          : "border-brand-blue/30 text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20"
                                      }`}
                                    >
                                      {status === "GOING" ? "Going" : "Interested"}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Create Event Modal */}
                {showEventModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white">Create Community Event</h3>
                        <button onClick={() => setShowEventModal(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Title</label>
                          <input
                            required
                            value={newEvent.title}
                            onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                            placeholder="e.g. Watch Party: Interstellar"
                            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                          <textarea
                            rows={3}
                            value={newEvent.description}
                            onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                            placeholder="What should members know about this event?"
                            className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date & Time</label>
                            <input
                              type="datetime-local"
                              required
                              value={newEvent.date}
                              onChange={e => setNewEvent(p => ({ ...p, date: e.target.value }))}
                              className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-brand-purple/60 transition"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Movie (optional)</label>
                            <input
                              value={newEvent.movieTitle}
                              onChange={e => setNewEvent(p => ({ ...p, movieTitle: e.target.value }))}
                              placeholder="e.g. Interstellar"
                              className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition">
                            Cancel
                          </button>
                          <button type="submit" disabled={creatingEvent} className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-50">
                            {creatingEvent ? "Creating..." : "Create Event"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MEMBERS TAB ── */}
            {activeTab === "members" && (
              <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      placeholder="Search members..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={memberSort}
                      onChange={e => setMemberSort(e.target.value as MemberSort)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="role">By Role</option>
                    </select>
                    <button onClick={() => setMemberView("grid")} className={`p-2.5 rounded-xl border transition ${memberView === "grid" ? "border-brand-purple/40 bg-brand-purple/10 text-brand-purple" : "border-white/10 text-slate-500 hover:text-white"}`}>
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setMemberView("list")} className={`p-2.5 rounded-xl border transition ${memberView === "list" ? "border-brand-purple/40 bg-brand-purple/10 text-brand-purple" : "border-white/10 text-slate-500 hover:text-white"}`}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingMembers ? (
                  <div className={`grid gap-3 ${memberView === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"}`}>
                    {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <EmptyState
                    icon={<Users className="w-12 h-12 text-slate-700" />}
                    title="No members found"
                    desc={memberSearch ? "Try a different search term." : "Be the first to join this community."}
                  />
                ) : memberView === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredMembers.map((m: any) => (
                      <Link key={m.id} href={`/dashboard/profile/${m.user?.id}`} className="group block">
                        <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-4 text-center hover:border-brand-purple/30 transition-all group-hover:shadow-lg group-hover:shadow-brand-purple/10">
                          <img
                            src={m.user?.profile?.avatarUrl || DEFAULT_AVATAR}
                            alt={m.user?.profile?.username}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/10 mx-auto mb-2 group-hover:border-brand-purple/40 transition"
                          />
                          <p className="text-xs font-bold text-white truncate">{m.user?.profile?.username || "Anonymous"}</p>
                          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${roleColor(m.role)}`}>
                            {roleIcon(m.role)}{m.role}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1.5">
                            Joined {formatDistanceToNow(new Date(m.joinedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMembers.map((m: any) => (
                      <Link key={m.id} href={`/dashboard/profile/${m.user?.id}`} className="block group">
                        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-4 flex items-center gap-3 hover:border-brand-purple/30 transition-all">
                          <img
                            src={m.user?.profile?.avatarUrl || DEFAULT_AVATAR}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{m.user?.profile?.username || "Anonymous"}</p>
                            <p className="text-[10px] text-slate-500">{m.user?.profile?.bio?.slice(0, 60) || "No bio"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${roleColor(m.role)}`}>
                              {roleIcon(m.role)}{m.role}
                            </span>
                            <span className="text-[10px] text-slate-600">
                              {formatDistanceToNow(new Date(m.joinedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ABOUT TAB ── */}
            {activeTab === "about" && (
              <div className="space-y-5">
                {/* Description */}
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">About</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{community.description}</p>
                  <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/5">
                    {[
                      { label: "Members", value: community._count?.members?.toLocaleString(), icon: <Users className="w-4 h-4 text-brand-blue" /> },
                      { label: "Posts", value: community._count?.communityPosts?.toLocaleString(), icon: <MessageSquare className="w-4 h-4 text-brand-purple" /> },
                      { label: "Type", value: community.type?.replace("_", " "), icon: <Globe className="w-4 h-4 text-emerald-400" /> },
                      { label: "Created", value: format(new Date(community.createdAt), "MMM d, yyyy"), icon: <Calendar className="w-4 h-4 text-amber-400" /> },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">{item.icon}</div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                {community.rules?.length > 0 && (
                  <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Community Rules</h3>
                    <ol className="space-y-3">
                      {community.rules.map((rule: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-[10px] font-bold text-brand-purple shrink-0 mt-0.5">{i + 1}</span>
                          <p className="text-sm text-slate-300 leading-relaxed">{rule}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Moderators */}
                {community.members?.filter((m: any) => ["OWNER", "ADMIN", "MODERATOR"].includes(m.role)).length > 0 && (
                  <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Moderators</h3>
                    <div className="space-y-3">
                      {community.members
                        .filter((m: any) => ["OWNER", "ADMIN", "MODERATOR"].includes(m.role))
                        .map((m: any) => (
                          <Link key={m.id} href={`/dashboard/profile/${m.user?.id}`} className="flex items-center gap-3 group">
                            <img src={m.user?.profile?.avatarUrl || DEFAULT_AVATAR} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white group-hover:text-brand-purple transition">{m.user?.profile?.username}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${roleColor(m.role)}`}>
                              {roleIcon(m.role)}{m.role}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="sticky top-20 space-y-4">

              {/* Community Stats */}
              <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">Community Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: "Members", value: community._count?.members || 0, icon: <Users className="w-4 h-4 text-brand-blue" />, color: "text-brand-blue" },
                    { label: "Total Posts", value: community._count?.communityPosts || 0, icon: <MessageSquare className="w-4 h-4 text-brand-purple" />, color: "text-brand-purple" },
                    { label: "Events", value: community._count?.communityEvents || 0, icon: <Calendar className="w-4 h-4 text-emerald-400" />, color: "text-emerald-400" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {stat.icon}
                        <span className="text-xs text-slate-400">{stat.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${stat.color}`}>{stat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4 text-brand-gold" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top Contributors</h3>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((m: any, i: number) => (
                      <Link key={m.id} href={`/dashboard/profile/${m.user?.id}`} className="flex items-center gap-3 group">
                        <span className={`text-xs font-black w-5 text-center ${i === 0 ? "text-brand-gold" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-slate-600"}`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                        <img src={m.user?.profile?.avatarUrl || DEFAULT_AVATAR} alt="" className="w-7 h-7 rounded-full object-cover border border-white/10" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-brand-purple transition">{m.user?.profile?.username || "Anonymous"}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">{m.user?._count?.posts || 0}p</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              {events.length > 0 && (
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Upcoming Events</h3>
                  </div>
                  <div className="space-y-3">
                    {events.slice(0, 3).map((ev: any) => (
                      <div key={ev.id} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[8px] font-bold text-brand-purple uppercase">{format(new Date(ev.date), "MMM")}</span>
                          <span className="text-xs font-extrabold text-white">{format(new Date(ev.date), "d")}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500">{ev._count?.rsvps || 0} attending</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setActiveTab("events")} className="w-full text-[10px] text-brand-blue font-bold text-center hover:text-brand-purple transition pt-1">
                      View all events →
                    </button>
                  </div>
                </div>
              )}

              {/* Community Rules (compact) */}
              {community.rules?.length > 0 && (
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rules</h3>
                  </div>
                  <ol className="space-y-2">
                    {community.rules.slice(0, 5).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[10px] font-black text-brand-purple shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{rule}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Recent Members */}
              {community.members?.length > 0 && (
                <div className="bg-slate-900/60 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recent Members</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {community.members.slice(0, 12).map((m: any) => (
                      <Link key={m.id} href={`/dashboard/profile/${m.user?.id}`} title={m.user?.profile?.username}>
                        <img
                          src={m.user?.profile?.avatarUrl || DEFAULT_AVATAR}
                          alt={m.user?.profile?.username}
                          className="w-8 h-8 rounded-full object-cover border border-white/10 hover:border-brand-purple/40 hover:scale-110 transition"
                        />
                      </Link>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab("members")} className="w-full text-[10px] text-brand-blue font-bold text-center hover:text-brand-purple transition mt-3">
                    View all {community._count?.members} members →
                  </button>
                </div>
              )}

              {/* AI Spotlight */}
              <div className="bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 border border-brand-purple/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-purple">Ask AI Companion</h3>
                </div>
                
                <form onSubmit={handleCommunityAiAsk} className="space-y-3">
                  <textarea
                    rows={2}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Ask something about ${community.name}...`}
                    className="w-full resize-none rounded-xl border border-brand-purple/30 bg-slate-950/80 px-3 py-2 text-xs text-white outline-none placeholder-slate-500 transition-colors focus:border-brand-purple focus:bg-slate-950"
                  />
                  <button
                    type="submit"
                    disabled={aiSearching || !aiPrompt.trim()}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
                  >
                    {aiSearching ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </form>


                {aiResponse && (
                  <div className="mt-4 rounded-2xl border border-brand-blue/30 bg-slate-900/80 overflow-hidden animate-in fade-in zoom-in duration-300 relative">
                    <button
                      onClick={() => { setAiResponse(null); setAiSuggested(null); }}
                      className="absolute top-2 right-2 text-slate-500 hover:text-white z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {/* Poster row */}
                    {aiSuggested?.posterPath && (
                      <div className="flex gap-3 p-3 border-b border-white/5">
                        <img
                          src={`/api/tmdb/img?path=/t/p/w92${aiSuggested.posterPath}`}
                          alt={aiSuggested.title}
                          className="w-10 h-14 object-cover rounded-lg border border-white/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="text-xs font-bold text-white truncate">{aiSuggested.title}</p>
                          {aiSuggested.rating && (
                            <div className="flex items-center gap-0.5 mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-bold text-amber-400">{Number(aiSuggested.rating).toFixed(1)}</span>
                            </div>
                          )}
                          {aiSuggested.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {aiSuggested.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-[9px] font-bold">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
                        <span className="text-[10px] font-bold text-brand-blue">AI Companion</span>
                      </div>
                      <p className="text-[11px] font-light leading-relaxed text-slate-300 whitespace-pre-line">
                        {aiResponse.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </p>
                      {aiSuggested?.id && (
                        <Link href={`/dashboard/movies/${aiSuggested.id}`} className="inline-block mt-2 text-[10px] font-bold text-brand-purple hover:text-brand-blue transition-colors">
                          View Movie →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────
function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/30 border border-white/5 rounded-2xl gap-3">
      {icon}
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{desc}</p>
    </div>
  );
}
