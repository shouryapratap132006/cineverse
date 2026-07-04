"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCineverseAuth } from "@/components/provider";
import {
  MapPin, Globe, Award, Clock, Film, Star, MessageSquare,
  Bookmark, Heart, BarChart2, Edit3, Grid, List
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { getUserProfile } from "@/actions/profile";
import { getFeed } from "@/actions/social";
import { formatDistanceToNow } from "date-fns";

const TABS = [
  { id: "activity", label: "Activity", icon: Clock },
  { id: "posts", label: "Posts", icon: MessageSquare },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "genres", label: "Taste", icon: BarChart2 },
];

export default function ProfilePage() {
  const { user } = useCineverseAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");

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

  // Load user posts when Posts tab clicked
  useEffect(() => {
    if (activeTab === "posts" && profileData && userPosts.length === 0) {
      getFeed().then(res => {
        if (res.success && res.posts) {
          // Filter to only this user's posts
          const myPosts = (res.posts as any[]).filter(
            (p: any) => p.userId === profileData.id
          );
          setUserPosts(myPosts);
        }
      });
    }
  }, [activeTab, profileData]);

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
    <div className="w-full pb-16 xl:pr-[340px]">

      {/* Cover Banner */}
      <div className="h-[260px] w-full relative overflow-hidden">
        <img
          src={profile.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400"}
          alt="Banner"
          className="w-full h-full object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 relative z-10 space-y-6">

        {/* Profile Card */}
        <GlassCard hoverGlow={false} className="p-6 md:p-8 border-white/10 bg-slate-950/90 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-5">

            <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
              {/* Avatar */}
              <div className="relative -mt-20 md:-mt-16">
                <img
                  src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileData.id}`}
                  alt={profile.username}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-slate-950 shadow-2xl"
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h1 className="font-display font-extrabold text-2xl text-white tracking-tight">
                    {profile.username || "Cinephile"}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 text-[10px] font-bold uppercase tracking-wider">
                    {profile.reputation || "Bronze Star"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 max-w-lg leading-relaxed">
                  {profile.bio || "Cinephile. Explore my reviews and film diary."}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.country || "Earth"}</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{profile.language || "English"}</span>
                </div>
              </div>
            </div>

            <Link
              href="/onboarding"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-white/5 pt-5 mt-6">
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
