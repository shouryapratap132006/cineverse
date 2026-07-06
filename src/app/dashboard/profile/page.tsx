"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCineverseAuth } from "@/components/provider";
import {
  MapPin, Globe, Award, Clock, Film, Star, MessageSquare,
  Bookmark, Heart, BarChart2, Edit3, X, Save, Camera,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { getUserProfile, getUserPosts } from "@/actions/profile";
import { updateProfile } from "@/actions/user";
import { formatDistanceToNow } from "date-fns";

const TABS = [
  { id: "activity", label: "Activity", icon: Clock },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "genres", label: "Taste", icon: BarChart2 },
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

import { ACTOR_AVATARS } from "@/lib/avatars";

export default function ProfilePage() {
  const { user } = useCineverseAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");

  // Edit modal state
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

  useEffect(() => {
    getUserProfile().then((res) => {
      if (res.success && res.user) {
        setProfileData(res.user);
        setLoading(false);
      } else {
        window.location.href = "/onboarding";
      }
    });
  }, [user]);

  // Re-fetch posts and reviews whenever their tab becomes active
  useEffect(() => {
    if (activeTab === "posts" && profileData) {
      getUserPosts(profileData.id).then(res => {
        if (res.success && res.posts) setUserPosts(res.posts);
      });
    }
    if (activeTab === "reviews" && profileData) {
      getUserProfile().then(res => {
        if (res.success && res.user) setProfileData(res.user);
      });
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
    if (!editUsername.trim()) {
      setSaveError("Username is required.");
      return;
    }
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
      // Refresh profile data
      getUserProfile().then((r) => {
        if (r.success && r.user) setProfileData(r.user);
      });
      setShowEditModal(false);
    } else {
      setSaveError(res.error || "Failed to save.");
    }
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

  return (
    <div className="w-full pb-16">

      {/* Banner */}
      <div className="h-[180px] md:h-[260px] w-full relative">
        <img
          src={profile.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400"}
          alt="Banner"
          className="w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 space-y-4">

        {/* Avatar row — pulled up by exactly half avatar height so it straddles the banner edge */}
        <div className="flex items-end justify-between -mt-10 md:-mt-14 px-1">
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl || `https://image.tmdb.org/t/p/w185/mkdRcVIQl4WZhDf1vXKWTD7HZrZ.jpg`}
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

        {/* Profile Card */}
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
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 border-t border-white/5 pt-4 mt-4">
            {[
              { label: "Followers", value: profileData._count?.followers || 0 },
              { label: "Following", value: profileData._count?.following || 0 },
              { label: "Reviews", value: profileData._count?.reviews || 0 },
              { label: "Lists", value: profileData._count?.lists || 0 },
              { label: "Posts", value: profileData._count?.posts || 0 },
            ].map(stat => (
              <div key={stat.label} className="text-center md:text-left space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">{stat.label}</span>
                <span className="text-xl font-extrabold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 p-1 rounded-2xl">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
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

        {/* Tab Content */}
        <div className="space-y-4 min-h-[300px]">

          {/* ACTIVITY TAB */}
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

          {/* POSTS TAB */}
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

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {profileData.reviews?.length > 0 ? (
                profileData.reviews.map((rev: any) => (
                  <Link key={rev.id} href={`/dashboard/movies/${rev.movieId}`} className="group block">
                    <GlassCard hoverGlow={false} className="p-5 border-white/5 bg-slate-900/50 hover:border-brand-blue/30 transition-all">
                      <div className="flex items-start gap-4">
                        {rev.movie?.posterPath && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${rev.movie.posterPath}`}
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

          {/* TASTE TAB */}
          {activeTab === "genres" && (
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
                      <span key={a} className="px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs font-bold text-pink-400">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.favoriteDirectors?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Favorite Directors</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.favoriteDirectors.map((d: string) => (
                      <span key={d} className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <h2 className="text-base font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Username & Bio */}
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

              {/* Avatar picker */}
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

              {/* Banner picker */}
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

              {/* Language & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Language</label>
                  <input
                    type="text"
                    value={editLanguage}
                    onChange={e => setEditLanguage(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={e => setEditCountry(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition"
                  />
                </div>
              </div>

              {/* Favorite Genres */}
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

              {saveError && (
                <p className="text-xs text-red-400 font-semibold">{saveError}</p>
              )}
            </div>

            {/* Modal Footer */}
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
