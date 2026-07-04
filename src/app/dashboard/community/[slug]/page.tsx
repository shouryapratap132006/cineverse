"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Globe, Users, Shield, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { getCommunity, joinCommunity, leaveCommunity } from "@/actions/community";
import GlassCard from "@/components/shared/GlassCard";
import PostComposer from "@/components/social/PostComposer";

export default function CommunityPage() {
  const { slug } = useParams() as { slug: string };
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunity(slug).then(res => {
      if (res.success) setCommunity(res.community);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!community) {
    return <div className="text-center py-20 text-white">Community not found.</div>;
  }

  return (
    <div className="w-full pb-16">
      
      {/* Banner */}
      <div className="h-[240px] w-full relative overflow-hidden">
        <img
          src={community.bannerUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200"}
          alt="Banner"
          className="w-full h-full object-cover filter brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-16 relative z-10">
        
        <GlassCard hoverGlow={false} className="p-6 border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border-2 border-white/10 shadow-lg shrink-0">
              <Globe className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display font-extrabold text-2xl text-white">{community.name}</h1>
              <p className="text-sm text-slate-400 max-w-xl">{community.description}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 text-xs font-semibold text-slate-500 pt-2">
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {community._count.members} Members</span>
                <span className="flex items-center"><MessageSquare className="w-3.5 h-3.5 mr-1" /> {community._count.communityPosts} Posts</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="py-2.5 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-sm transition">
              Join Community
            </button>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-6">
            <PostComposer />
            <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No posts yet</h3>
              <p className="text-sm text-slate-500">Be the first to start a discussion in {community.name}.</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-brand-blue" />
                <span>About Community</span>
              </h3>
              <GlassCard hoverGlow={false} className="p-4 border-white/5 space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">{community.description}</p>
                <hr className="border-white/5" />
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Created: {new Date(community.createdAt).toLocaleDateString()}</p>
                  <p>Type: {community.type}</p>
                </div>
              </GlassCard>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
