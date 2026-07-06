"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Globe, Users, Shield, Calendar as CalendarIcon, MessageSquare,
  Sparkles, Plus, Calendar, Star, Clock, MapPin, Check, LogOut
} from "lucide-react";
import { getCommunity, joinCommunity, leaveCommunity, getUpcomingEvents, createEvent, rsvpEvent } from "@/actions/community";
import GlassCard from "@/components/shared/GlassCard";
import PostComposer from "@/components/social/PostComposer";
import PostCard from "@/components/social/PostCard";
import { DEFAULT_AVATAR } from "@/lib/avatars";

export default function CommunityPage() {
  const { slug } = useParams() as { slug: string };
  const [community, setCommunity] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [activeSubTab, setActiveSubTab] = useState<"discussions" | "events" | "members">("discussions");
  const [events, setEvents] = useState<any[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", movieTitle: "" });

  const fetchCommunityDetails = async () => {
    const res = await getCommunity(slug);
    if (res.success && res.community) {
      setCommunity(res.community);
      setIsMember(res.isMember || false);
      setUserRole(res.userRole || null);
    }
  };

  const fetchEvents = async () => {
    if (community?.id) {
      const res = await getUpcomingEvents(community.id);
      if (res.success && res.events) {
        setEvents(res.events);
      }
    }
  };

  useEffect(() => {
    fetchCommunityDetails().then(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (community?.id) {
      fetchEvents();
    }
  }, [community?.id, activeSubTab]);

  const handleJoinToggle = async () => {
    if (!community || actionLoading) return;
    setActionLoading(true);
    if (isMember) {
      const res = await leaveCommunity(community.id);
      if (res.success) {
        setIsMember(false);
        setUserRole(null);
        fetchCommunityDetails();
      }
    } else {
      const res = await joinCommunity(community.id);
      if (res.success) {
        setIsMember(true);
        setUserRole("MEMBER");
        fetchCommunityDetails();
      }
    }
    setActionLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !newEvent.title || !newEvent.date) return;
    setActionLoading(true);
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
      fetchEvents();
    } else {
      alert("Error creating event: " + res.error);
    }
    setActionLoading(false);
  };

  const handleRsvp = async (eventId: string, status: "GOING" | "INTERESTED" | "NOT_GOING") => {
    const res = await rsvpEvent(eventId, status);
    if (res.success) {
      fetchEvents();
    }
  };

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

  const canManage = userRole === "OWNER" || userRole === "ADMIN" || userRole === "MODERATOR";

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

      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        
        {/* Profile Card */}
        <GlassCard hoverGlow={false} className="p-6 border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-white/10 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Globe className="w-10 h-10 text-green-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="font-display font-extrabold text-2xl text-white">{community.name}</h1>
                {userRole && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-purple/20 border border-brand-purple/30 text-brand-purple uppercase tracking-wider">
                    {userRole}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 max-w-xl">{community.description}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-500 pt-2">
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {community._count.members} Members</span>
                <span className="flex items-center"><MessageSquare className="w-3.5 h-3.5 mr-1" /> {community._count.communityPosts} Discussions</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleJoinToggle}
            disabled={actionLoading}
            className={`py-2.5 px-6 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
              isMember
                ? "bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white"
                : "bg-green-500 hover:bg-green-400 text-slate-950"
            }`}
          >
            {isMember ? (
              <>
                <LogOut className="w-4 h-4" />
                <span>Leave</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Join Community</span>
              </>
            )}
          </button>
        </GlassCard>

        {/* Subtabs selection */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-3 mb-6">
          {[
            { id: "discussions", label: "Discussions", icon: MessageSquare },
            { id: "events", label: "Events", icon: CalendarIcon },
            { id: "members", label: "Members", icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all -mb-[14px] ${
                  activeSubTab === tab.id
                    ? "border-green-400 text-green-400"
                    : "border-transparent text-slate-500 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Main Area) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeSubTab === "discussions" && (
              <>
                {isMember ? (
                  <PostComposer onPostCreated={fetchCommunityDetails} communityId={community.id} />
                ) : (
                  <div className="p-4 bg-white/3 border border-white/5 rounded-2xl text-center text-xs text-slate-400">
                    Join this community to share your thoughts.
                  </div>
                )}

                <div className="space-y-4">
                  {community.communityPosts && community.communityPosts.length > 0 ? (
                    community.communityPosts.map((cp: any) => (
                      <PostCard key={cp.post.id} post={cp.post} onUpdate={fetchCommunityDetails} />
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-white/5">
                      <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-1">No posts yet</h3>
                      <p className="text-sm text-slate-500">Be the first to start a discussion in {community.name}.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSubTab === "events" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Community Events</h3>
                  {canManage && (
                    <button
                      onClick={() => setShowEventModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-xs font-bold rounded-lg hover:bg-brand-purple/30 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Event
                    </button>
                  )}
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-white/5">
                    <CalendarIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="font-bold text-white text-sm">No events scheduled</p>
                    <p className="text-xs text-slate-500 mt-0.5">Stay tuned or check back later.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((ev: any) => {
                      const eventDate = new Date(ev.date);
                      return (
                        <GlassCard key={ev.id} hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/20 flex flex-col items-center justify-center shrink-0 text-center">
                            <span className="text-lg font-black text-brand-purple leading-none">{eventDate.getDate()}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{eventDate.toLocaleString("default", { month: "short" })}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                            {ev.description && <p className="text-xs text-slate-400 mt-0.5">{ev.description}</p>}
                            {ev.movieTitle && <span className="text-[10px] text-brand-purple font-semibold mt-1.5 block">🎬 Featured Movie: {ev.movieTitle}</span>}
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                              <span>Created by {ev.creator.profile?.username || "Admin"}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-600" />
                              <span>{ev._count?.rsvps || 0} going</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 self-center shrink-0">
                            <button onClick={() => handleRsvp(ev.id, "GOING")} className="px-2.5 py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-500/30 transition">
                              Going
                            </button>
                            <button onClick={() => handleRsvp(ev.id, "INTERESTED")} className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold rounded-lg hover:text-white transition">
                              Interested
                            </button>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "members" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Community Members</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {community.members?.map((m: any) => (
                    <GlassCard key={m.user.id} hoverGlow={false} className="p-3 border-white/5 bg-slate-900/40 flex items-center gap-3">
                      <img src={m.user.profile?.avatarUrl || DEFAULT_AVATAR} alt="" className="w-9 h-9 rounded-full object-cover border border-white/15" />
                      <div className="min-w-0">
                        <Link href={`/dashboard/profile/${m.user.id}`} className="text-xs font-bold text-white hover:underline truncate block">
                          {m.user.profile?.username || "cinephile"}
                        </Link>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">{m.role}</span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (Sidebar details) */}
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

      {/* CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Create Event</h2>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-purple" placeholder="e.g. Inception Rewatch Discussion" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Movie (Optional)</label>
                <input type="text" value={newEvent.movieTitle} onChange={e => setNewEvent({ ...newEvent, movieTitle: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-purple" placeholder="e.g. Inception" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Date & Time</label>
                <input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-purple" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-purple resize-none" rows={3} placeholder="Tell members about the event details..." />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold rounded-xl text-sm disabled:opacity-50">
                  {actionLoading ? "Saving..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
