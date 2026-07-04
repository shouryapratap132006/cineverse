"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Star, MapPin, Globe, Award, Clock, Users, UserPlus, UserCheck, MessageSquare } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { getUserProfile } from "@/actions/profile";
import { toggleFollow } from "@/actions/social";
import { sendFriendRequest } from "@/actions/friends";

export default function OtherProfilePage() {
  const { id } = useParams() as { id: string };
  const { user } = useCineverseAuth();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(id).then((res) => {
      if (res.success) {
        setProfileData(res.user);
        setConnection(res.connection);
        setLoading(false);
      } else {
        setLoading(false);
        // It will just be null and handled below
      }
    });
  }, [id, user]);

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const profile = profileData.profile || {};

  const handleFollow = async () => {
    const res = await toggleFollow(id);
    if (res.success) {
      setConnection({ ...connection, isFollowing: res.following });
      setProfileData({
        ...profileData,
        _count: {
          ...profileData._count,
          followers: res.following ? profileData._count.followers + 1 : profileData._count.followers - 1
        }
      });
    }
  };

  const handleFriendRequest = async () => {
    const res = await sendFriendRequest(id);
    if (res.success) {
      setConnection({ ...connection, friendRequestSent: true });
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      
      <div className="h-[280px] w-full relative overflow-hidden">
        <img
          src={profile.bannerUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600"}
          alt="Profile Banner"
          className="w-full h-full object-cover filter brightness-[0.7]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20 relative z-10 space-y-8">
        
        <GlassCard hoverGlow={false} className="p-6 md:p-8 border-white/10 bg-slate-950/80 relative backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
              <img
                src={profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120"}
                alt={profile.username}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-950 shadow-2xl relative -mt-16 md:mt-0"
              />
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                    {profile.username || "Cinephile"}
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-brand-purple/20 text-brand-purple border border-brand-purple/20 text-[9px] font-bold uppercase tracking-wider">
                    {profile.reputation || "Bronze Star"}
                  </span>
                  {connection?.isFriend && (
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider">
                      Mutual
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 font-light max-w-xl leading-relaxed">
                  {profile.bio || "No bio yet."}
                </p>

                <div className="flex items-center justify-center md:justify-start space-x-4 text-xs text-slate-400">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {profile.country || "Earth"}
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {profile.language || "English"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleFollow}
                className={`py-2 px-4 rounded-xl border text-sm font-bold transition flex items-center space-x-2 ${
                  connection?.isFollowing 
                    ? "bg-slate-800 border-white/10 text-white hover:bg-slate-700" 
                    : "bg-brand-blue border-brand-blue text-white hover:bg-blue-500"
                }`}
              >
                {connection?.isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              <button
                onClick={handleFriendRequest}
                disabled={connection?.isFriend || connection?.friendRequestSent || connection?.friendRequestReceived}
                className={`py-2 px-4 rounded-xl border text-sm font-bold transition flex items-center space-x-2 ${
                  connection?.isFriend ? "bg-green-500/20 border-green-500/30 text-green-400"
                  : connection?.friendRequestSent ? "bg-slate-800 border-white/10 text-slate-400"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {connection?.isFriend ? "Friends" 
                 : connection?.friendRequestSent ? "Request Sent" 
                 : connection?.friendRequestReceived ? "Pending Request"
                 : "Add Friend"}
              </button>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-t border-white/5 pt-6 mt-8">
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Followers</span>
              <span className="text-lg font-extrabold text-white">{profileData._count.followers}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Following</span>
              <span className="text-lg font-extrabold text-white">{profileData._count.following}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Reviews</span>
              <span className="text-lg font-extrabold text-white">{profileData._count.reviews}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Lists</span>
              <span className="text-lg font-extrabold text-white">{profileData._count.lists}</span>
            </div>
            <div className="text-center md:text-left space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Posts</span>
              <span className="text-lg font-extrabold text-white">{profileData._count.posts}</span>
            </div>
          </div>
        </GlassCard>

        {/* ... Rest of profile layout matches the main profile page ... */}
        
      </div>
    </div>
  );
}
