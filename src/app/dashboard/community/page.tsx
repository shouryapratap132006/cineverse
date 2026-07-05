"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe, Users, Plus, Search, Shield, Flame, Calendar, Film,
  Star, ChevronRight, X, Clock, Clapperboard, UserPlus, Check,
  Popcorn, Crown, BookOpen
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import {
  createCommunity, getCommunities, getUpcomingEvents, getFilmClubs,
  createFilmClub, joinFilmClub, joinCommunity
} from "@/actions/community";
import { formatDistanceToNow } from "date-fns";

const TABS = [
  { id: "discover", label: "Discover", icon: Globe },
  { id: "joined", label: "Joined", icon: Check },
  { id: "events", label: "Events", icon: Calendar },
  { id: "filmclubs", label: "Film Clubs", icon: Popcorn },
];

const FEATURED_COMMUNITIES = [
  {
    name: "Sci-Fi Enthusiasts",
    description: "Explore the cosmos through cinema. Hard sci-fi, space opera, cyberpunk — it all belongs here.",
    type: "Genre",
    slug: "sci-fi-enthusiasts",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    accent: "from-sky-500/20 to-indigo-600/20",
    icon: "🚀",
  },
  {
    name: "Nolanverse",
    description: "For those who believe Christopher Nolan hasn't made a bad film. A24 energy, blockbuster scale.",
    type: "Director",
    slug: "nolanverse",
    banner: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800",
    accent: "from-slate-500/30 to-zinc-600/20",
    icon: "⌛",
  },
  {
    name: "A24 Fanatics",
    description: "Where prestige cinema meets cult obsession. Everything from Midsommar to Everything Everywhere.",
    type: "Studio",
    slug: "a24-fanatics",
    banner: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    accent: "from-rose-500/20 to-pink-600/20",
    icon: "🎞",
  },
  {
    name: "Bollywood Blockbusters",
    description: "RRR, KGF, Baahubali and beyond. Celebrating the grandeur of Indian cinema.",
    type: "Regional",
    slug: "bollywood-blockbusters",
    banner: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    accent: "from-orange-500/20 to-amber-600/20",
    icon: "🎊",
  },
  {
    name: "Anime Film Club",
    description: "Studio Ghibli, Makoto Shinkai, and everything in between. Animated doesn't mean for kids.",
    type: "Anime",
    slug: "anime-film-club",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
    accent: "from-violet-500/20 to-purple-600/20",
    icon: "⛩",
  },
  {
    name: "Horror Freaks",
    description: "From Ari Aster to James Wan — we love being scared. No jump scare slander.",
    type: "Genre",
    slug: "horror-freaks",
    banner: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800",
    accent: "from-red-900/30 to-slate-800/40",
    icon: "🕯",
  },
];

export default function CommunitiesHub() {
  const [activeTab, setActiveTab] = useState("discover");
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filmClubs, setFilmClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: "", description: "" });
  const [newClub, setNewClub] = useState({ name: "", description: "", isPublic: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    if (activeTab === "discover") {
      const res = await getCommunities("all");
      if (res.success && res.communities) setCommunities(res.communities);
    } else if (activeTab === "joined") {
      const res = await getCommunities("joined");
      if (res.success && res.communities) setCommunities(res.communities);
    } else if (activeTab === "events") {
      const res = await getUpcomingEvents();
      if (res.success && res.events) setEvents(res.events);
    } else if (activeTab === "filmclubs") {
      const res = await getFilmClubs();
      if (res.success && res.clubs) setFilmClubs(res.clubs);
    }
    setLoading(false);
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) return;
    setIsSubmitting(true);
    const slug = newCommunity.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const res = await createCommunity({ name: newCommunity.name, slug, description: newCommunity.description });
    if (res.success) {
      setShowCreateModal(false);
      window.location.href = `/dashboard/community/${slug}`;
    } else {
      alert("Error: " + res.error);
    }
    setIsSubmitting(false);
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createFilmClub(newClub);
    if (res.success) {
      setShowCreateClubModal(false);
      loadData();
    } else alert("Error: " + res.error);
    setIsSubmitting(false);
  };

  const handleJoinCommunity = async (id: string) => {
    await joinCommunity(id);
    loadData();
  };

  const handleJoinClub = async (id: string) => {
    await joinFilmClub(id);
    loadData();
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 min-h-screen space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white flex items-center gap-3">
            <span className="inline-flex w-11 h-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20">
              <Globe className="w-5 h-5 text-green-400" />
            </span>
            Communities
          </h1>
          <p className="text-sm text-slate-400 mt-1">Join cinephiles worldwide. Discuss, obsess, and discover together.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateClubModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition"
          >
            <Popcorn className="w-4 h-4 text-amber-400" />
            New Film Club
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-xs font-bold text-white hover:opacity-90 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Create Community
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 p-1 rounded-2xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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

      {/* Search (for discover/joined tabs) */}
      {(activeTab === "discover" || activeTab === "joined") && (
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-purple/50 transition"
          />
        </div>
      )}

      {/* DISCOVER TAB */}
      {activeTab === "discover" && (
        <div className="space-y-8">
          {/* Featured (curated) */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Featured Communities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURED_COMMUNITIES.map(c => (
                <Link key={c.slug} href={`/dashboard/community/${c.slug}`} className="group">
                  <GlassCard hoverGlow={false} className="overflow-hidden border-white/5 hover:border-white/15 transition-all p-0">
                    <div className="h-28 relative">
                      <img src={c.banner} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-[0.6]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent" />
                      <div className={`absolute inset-0 bg-gradient-to-br ${c.accent} opacity-50`} />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="text-xl">{c.icon}</span>
                        <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[9px] font-bold text-white/80 uppercase tracking-wider border border-white/10">{c.type}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-sm text-white group-hover:text-green-400 transition">{c.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-semibold">Community</span>
                        <span className="text-[10px] font-bold text-green-400 group-hover:underline">Join →</span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>

          {/* User-created communities from DB */}
          {filteredCommunities.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">All Communities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCommunities.map(c => (
                  <CommunityCard key={c.id} community={c} onJoin={handleJoinCommunity} />
                ))}
              </div>
            </section>
          )}

          {filteredCommunities.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No user communities yet — be the first to create one!
            </div>
          )}
        </div>
      )}

      {/* JOINED TAB */}
      {activeTab === "joined" && (
        <div className="space-y-4">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredCommunities.length === 0 ? (
            <EmptyState
              icon={<Globe className="w-12 h-12 text-slate-700" />}
              title="You haven't joined any communities yet"
              subtitle="Head to Discover to find your tribe"
              action={{ label: "Discover Communities", onClick: () => setActiveTab("discover") }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCommunities.map(c => (
                <CommunityCard key={c.id} community={c} isMember onJoin={handleJoinCommunity} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Upcoming Events</h2>
          </div>

          {loading ? <LoadingSkeleton /> : events.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-12 h-12 text-slate-700" />}
              title="No upcoming events"
              subtitle="Events appear when community moderators schedule them"
            />
          ) : (
            <div className="space-y-3">
              {events.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}

          {/* Placeholder events for new users */}
          <section className="space-y-3 mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Global Events</h2>
            {[
              { title: "Watch Party: Interstellar 10th Anniversary", date: "July 12, 2025", community: "Nolanverse", emoji: "⌛", going: 234 },
              { title: "Monthly Horror Rewatch: The Shining", date: "July 20, 2025", community: "Horror Freaks", emoji: "🕯", going: 156 },
              { title: "Ghibli Marathon: 10 Hours, 10 Films", date: "August 3, 2025", community: "Anime Film Club", emoji: "⛩", going: 412 },
              { title: "Best Picture Bracket Tournament", date: "August 15, 2025", community: "A24 Fanatics", emoji: "🏆", going: 89 },
            ].map(ev => (
              <GlassCard key={ev.title} hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 hover:border-white/15 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/20 flex items-center justify-center text-xl shrink-0">
                    {ev.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white">{ev.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}</span>
                      <span className="text-[10px] text-green-400 font-semibold">{ev.going} going</span>
                    </div>
                    <span className="text-[10px] text-brand-purple font-semibold mt-1 block">{ev.community}</span>
                  </div>
                  <button className="shrink-0 px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-bold rounded-lg hover:bg-brand-purple/30 transition">
                    RSVP
                  </button>
                </div>
              </GlassCard>
            ))}
          </section>
        </div>
      )}

      {/* FILM CLUBS TAB */}
      {activeTab === "filmclubs" && (
        <div className="space-y-6">
          {loading ? <LoadingSkeleton /> : filmClubs.length === 0 ? (
            <EmptyState
              icon={<Popcorn className="w-12 h-12 text-slate-700" />}
              title="No film clubs yet"
              subtitle="Create a private watchlist club with friends"
              action={{ label: "Create Film Club", onClick: () => setShowCreateClubModal(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filmClubs.map(club => (
                <FilmClubCard key={club.id} club={club} onJoin={handleJoinClub} />
              ))}
            </div>
          )}

          {/* How it works */}
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">What's a Film Club?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "👥", title: "Invite Friends", desc: "Create a private club and invite your cinema crew." },
                { icon: "🎬", title: "Build a Watchlist", desc: "Collaboratively add movies you all want to see." },
                { icon: "💬", title: "Discuss & Rate", desc: "After each watch, share reviews and ratings together." },
              ].map(item => (
                <GlassCard key={item.title} hoverGlow={false} className="p-4 border-white/5 text-center space-y-2">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </GlassCard>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {showCreateModal && (
        <Modal title="Create Community" onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <Field label="Community Name" required>
              <input type="text" value={newCommunity.name} onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-brand-purple text-sm"
                placeholder="e.g. Cinema Snobs" required />
            </Field>
            <Field label="Description" required>
              <textarea value={newCommunity.description} onChange={e => setNewCommunity({ ...newCommunity, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-brand-purple resize-none text-sm"
                placeholder="What is this community about?" rows={3} required />
            </Field>
            <ModalActions onCancel={() => setShowCreateModal(false)} submitting={isSubmitting} submitLabel="Create Community" />
          </form>
        </Modal>
      )}

      {/* CREATE FILM CLUB MODAL */}
      {showCreateClubModal && (
        <Modal title="Create Film Club" onClose={() => setShowCreateClubModal(false)}>
          <form onSubmit={handleCreateClub} className="space-y-4">
            <Field label="Club Name" required>
              <input type="text" value={newClub.name} onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-brand-purple text-sm"
                placeholder="e.g. Friday Night Horrors" required />
            </Field>
            <Field label="Description">
              <textarea value={newClub.description} onChange={e => setNewClub({ ...newClub, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-brand-purple resize-none text-sm"
                placeholder="What will you watch together?" rows={2} />
            </Field>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="ispublic" checked={newClub.isPublic} onChange={e => setNewClub({ ...newClub, isPublic: e.target.checked })} className="w-4 h-4 accent-brand-purple" />
              <label htmlFor="ispublic" className="text-sm text-slate-300">Public (anyone can discover and join)</label>
            </div>
            <ModalActions onCancel={() => setShowCreateClubModal(false)} submitting={isSubmitting} submitLabel="Create Club" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function CommunityCard({ community: c, isMember, onJoin }: { community: any; isMember?: boolean; onJoin: (id: string) => void }) {
  const isJoined = isMember || c.members?.length > 0;
  return (
    <GlassCard hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 hover:border-white/15 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/community/${c.slug}`} className="block">
            <h3 className="text-sm font-bold text-white hover:text-green-400 transition truncate">{c.name}</h3>
          </Link>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-500 font-semibold">
              <Users className="w-3 h-3 inline mr-0.5" />{c._count?.members || 0} members
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              {c._count?.communityPosts || 0} posts
            </span>
          </div>
        </div>
        {!isJoined ? (
          <button onClick={() => onJoin(c.id)} className="shrink-0 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold rounded-lg hover:bg-green-500/30 transition">
            Join
          </button>
        ) : (
          <Link href={`/dashboard/community/${c.slug}`} className="shrink-0 px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-bold rounded-lg">
            View
          </Link>
        )}
      </div>
    </GlassCard>
  );
}

function EventCard({ event: ev }: { event: any }) {
  const eventDate = new Date(ev.date);
  const isToday = new Date().toDateString() === eventDate.toDateString();
  return (
    <GlassCard hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 hover:border-brand-purple/20 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/20 flex flex-col items-center justify-center shrink-0 text-center">
          <span className="text-lg font-black text-brand-purple leading-none">{eventDate.getDate()}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase">{eventDate.toLocaleString("default", { month: "short" })}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{ev.title}</h3>
          {ev.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
            {ev.community && (
              <Link href={`/dashboard/community/${ev.community.slug}`} className="text-brand-purple hover:underline font-semibold">
                {ev.community.name}
              </Link>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {ev._count?.rsvps || 0} going
            </span>
            {isToday && <span className="text-green-400 font-bold">TODAY</span>}
          </div>
        </div>
        <button className="shrink-0 px-3 py-1.5 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-bold rounded-lg hover:bg-brand-purple/30 transition">
          RSVP
        </button>
      </div>
    </GlassCard>
  );
}

function FilmClubCard({ club, onJoin }: { club: any; onJoin: (id: string) => void }) {
  const isJoined = club.members?.length > 0;
  return (
    <GlassCard hoverGlow={false} className="p-5 border-white/5 bg-slate-900/60 hover:border-amber-500/20 transition-all space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center">
            <Popcorn className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{club.name}</h3>
            {club.owner?.profile?.username && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                by {club.owner.profile.username}
              </span>
            )}
          </div>
        </div>
        {!isJoined ? (
          <button onClick={() => onJoin(club.id)} className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-500/30 transition">
            Join
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded-lg">
            ✓ Joined
          </span>
        )}
      </div>

      {club.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{club.description}</p>
      )}

      {/* Watchlist preview */}
      {club.watchlist?.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Watchlist:</span>
          <div className="flex gap-1.5">
            {club.watchlist.slice(0, 4).map((m: any) => (
              <div key={m.tmdbId} className="w-8 h-11 rounded bg-slate-800 border border-white/10 overflow-hidden">
                {m.posterPath && (
                  <img src={`https://image.tmdb.org/t/p/w92${m.posterPath}`} alt={m.title} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold border-t border-white/5 pt-3">
        <span><Users className="w-3 h-3 inline mr-1" />{club._count?.members || 0} members</span>
        <span><Film className="w-3 h-3 inline mr-1" />{club._count?.watchlist || 0} films</span>
        {!club.isPublic && <span className="text-amber-500">🔒 Private</span>}
      </div>
    </GlassCard>
  );
}

// Shared UI components
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}{required && " *"}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, submitting, submitLabel }: { onCancel: () => void; submitting: boolean; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition">Cancel</button>
      <button type="submit" disabled={submitting} className="px-5 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition">
        {submitting ? "Creating..." : submitLabel}
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-slate-800/60 rounded-xl border border-white/5" />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border border-white/5 bg-slate-900/30 rounded-2xl">
      <div className="opacity-50">{icon}</div>
      <div>
        <p className="font-bold text-white text-base">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      {action && (
        <button onClick={action.onClick} className="px-5 py-2.5 bg-brand-purple/20 border border-brand-purple/30 text-brand-purple font-bold text-sm rounded-xl hover:bg-brand-purple/30 transition">
          {action.label}
        </button>
      )}
    </div>
  );
}
