"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, UserPlus, Calendar, Sparkles, Star, PanelRightOpen, PanelRightClose, X } from "lucide-react";
import { getSuggestedUsers } from "@/actions/profile";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { getNotifications, markNotificationRead } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggested, setAiSuggested] = useState<any>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);

  useEffect(() => {
    getSuggestedUsers().then((res) => {
      if (res.success && res.users) setSuggestedUsers(res.users);
    });

    getNotifications(1, 5).then((res) => {
      if (res.success && res.notifications) setNotifications(res.notifications);
    });

    fetch(`${BASE}/movie/upcoming?api_key=${TMDB_KEY}&language=en-US&page=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          const formatted = data.results.slice(0, 3).map((m: any) => {
            const date = new Date(m.release_date);
            return {
              title: m.title,
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              genre: m.genre_ids ? "New Release" : "Unknown",
            };
          });
          setUpcomingMovies(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const handleReadNotification = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleQuickAiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiSearching(true);
    setAiSuggested(null);

    try {
      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();

      if (data.success) {
        setAiSuggested({
          title: data.tmdb?.title || data.movieTitle,
          year: data.movieYear,
          id: data.tmdb?.id || null,
          reason: data.response,
          rating: data.tmdb?.rating || null,
          posterPath: data.tmdb?.posterPath || null,
          tags: data.tags || [],
        });
      } else {
        setAiSuggested({
          title: "Error",
          year: null,
          id: null,
          reason: data.error || "Something went wrong. Please try again.",
          rating: null,
          posterPath: null,
          tags: [],
        });
      }
    } catch {
      setAiSuggested({
        title: "Network Error",
        year: null,
        id: null,
        reason: "Could not reach the AI companion. Check your connection.",
        rating: null,
        posterPath: null,
        tags: [],
      });
    } finally {
      setAiSearching(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed top-6 z-50 hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/85 text-slate-200 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-brand-purple/50 hover:text-white lg:flex ${isOpen ? "right-[20rem]" : "right-4"}`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </button>

      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-[320px] max-w-[90vw] transform border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Feed side panel</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-brand-purple/40 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[calc(100vh-5rem)] space-y-6 overflow-y-auto pr-1 scrollbar-thin">
          <div className="space-y-3.5">
            <h3 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
              <span>AI recommendations</span>
            </h3>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <form onSubmit={handleQuickAiAsk} className="space-y-3">
                <textarea
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Vibe check... what should I watch?"
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder-slate-500 transition-colors focus:border-brand-purple/50"
                />
                <button
                  type="submit"
                  disabled={aiSearching}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
                >
                  {aiSearching ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ask Companion</span>
                    </>
                  )}
                </button>
              </form>

              {aiSuggested && (
                <div className="mt-3 rounded-2xl border border-brand-purple/30 bg-slate-800/50 overflow-hidden animate-in fade-in zoom-in duration-300">
                  {/* Poster + info row */}
                  <div className="flex gap-3 p-3">
                    {aiSuggested.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${aiSuggested.posterPath}`}
                        alt={aiSuggested.title}
                        className="w-12 h-16 object-cover rounded-lg border border-white/10 shrink-0"
                      />
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{aiSuggested.title}</h4>
                        {aiSuggested.rating && (
                          <div className="flex items-center text-[10px] font-bold text-brand-gold shrink-0">
                            <Star className="mr-0.5 h-3 w-3 fill-brand-gold text-brand-gold" />
                            <span>{Number(aiSuggested.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      {aiSuggested.year && <p className="text-[10px] text-slate-500 mt-0.5">{aiSuggested.year}</p>}
                      {aiSuggested.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {aiSuggested.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple text-[9px] font-bold">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* AI explanation */}
                  <div className="px-3 pb-3">
                    <p className="text-[11px] leading-relaxed text-slate-300">{aiSuggested.reason}</p>
                    {aiSuggested.id && (
                      <Link href={`/dashboard/movies/${aiSuggested.id}`} className="inline-block mt-2 text-[10px] font-bold text-brand-purple hover:text-brand-blue transition-colors">
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Bell className="h-3.5 w-3.5 text-brand-purple" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleReadNotification(n.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition ${n.isRead ? "border-white/5 bg-white/3 hover:bg-white/5" : "border-brand-purple/30 bg-brand-purple/10 hover:bg-brand-purple/20"}`}
                  >
                    <p className="text-[11px] leading-normal text-slate-200">
                      <span className="mr-1 font-bold text-white">{n.actor?.profile?.username || "Someone"}</span>
                      {n.type === "LIKE"
                        ? "reacted to your post."
                        : n.type === "COMMENT"
                          ? "commented on your post."
                          : n.type === "MENTION"
                            ? "mentioned you."
                            : n.type === "FRIEND_REQUEST"
                              ? "sent you a friend request."
                              : n.type === "ACCEPTED"
                                ? "accepted your friend request."
                                : "interacted with you."}
                    </p>
                    <span className="text-[9px] font-semibold text-slate-500">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-center">
                  <span className="text-xs text-slate-500">No new notifications.</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            <h3 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <UserPlus className="h-3.5 w-3.5 text-brand-blue" />
              <span>Suggested Critics</span>
            </h3>
            <div className="space-y-2">
              {suggestedUsers.length > 0 ? (
                suggestedUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3">
                    <Link href={`/dashboard/profile/${u.id}`} className="group flex items-center space-x-2.5">
                      <img src={u.profile?.avatarUrl || DEFAULT_AVATAR} alt="avatar" className="h-8 w-8 rounded-full border border-white/10 object-cover transition group-hover:border-brand-purple" />
                      <div className="max-w-[100px] space-y-0.5 truncate">
                        <h4 className="truncate text-[11px] font-bold text-white transition group-hover:text-brand-blue">{u.profile?.username || "Unknown"}</h4>
                        <span className="block truncate text-[9px] text-slate-500">{u._count?.followers || 0} followers</span>
                      </div>
                    </Link>
                    <Link href={`/dashboard/profile/${u.id}`} className="rounded-md bg-brand-blue/20 p-1.5 text-brand-blue transition hover:bg-brand-blue/30">
                      <UserPlus className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-center">
                  <span className="text-xs text-slate-500">No suggestions right now.</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <h3 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-brand-gold" />
              <span>Release Calendar</span>
            </h3>
            <div className="space-y-2.5">
              {upcomingMovies.length > 0 ? (
                upcomingMovies.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3">
                    <div className="max-w-[150px] space-y-0.5">
                      <h4 className="truncate text-[11px] font-bold text-white">{m.title}</h4>
                      <span className="text-[9px] font-semibold text-slate-500">{m.genre}</span>
                    </div>
                    <span className="rounded-lg border border-brand-gold/20 bg-brand-gold/15 px-2 py-1 text-center text-[9px] font-bold leading-none text-brand-gold whitespace-nowrap">
                      {m.date}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-center">
                  <span className="text-[10px] text-slate-500">Loading upcoming...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
