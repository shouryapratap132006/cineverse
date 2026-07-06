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

const UPCOMING_MOVIES = [
  { title: "Blade Runner 2099", date: "July 24", genre: "Sci-Fi" },
  { title: "Nolan's Next Project", date: "August 12", genre: "Thriller" },
];

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggested, setAiSuggested] = useState<any>(null);
  const [aiSearching, setAiSearching] = useState(false);

  useEffect(() => {
    getSuggestedUsers().then((res) => {
      if (res.success && res.users) setSuggestedUsers(res.users);
    });

    getNotifications(1, 5).then((res) => {
      if (res.success && res.notifications) setNotifications(res.notifications);
    });
  }, []);

  const handleReadNotification = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleQuickAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiSearching(true);
    setAiSuggested(null);

    fetch(`${BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(aiPrompt)}&page=1`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const m = data.results[0];
          setAiSuggested({
            title: m.title,
            year: m.release_date ? m.release_date.split("-")[0] : "Unknown",
            id: String(m.id),
            reason: `Based on your request, this film matches with an average rating of ${m.vote_average?.toFixed(1)}. Overview: ${m.overview}`,
            rating: m.vote_average || 7.0,
          });
        } else {
          setAiSuggested({
            title: "Interstellar",
            year: "2014",
            id: "157336",
            reason: "Could not find an exact match. Here is a universal recommendation matching deep themes and sci-fi grandeur.",
            rating: 8.4,
          });
        }
        setAiSearching(false);
      })
      .catch(() => {
        setAiSuggested({
          title: "Inception",
          year: "2010",
          id: "27205",
          reason: "Error query matching. Recommending a timeless mind-bending thriller.",
          rating: 8.3,
        });
        setAiSearching(false);
      });
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
                <div className="mt-3 space-y-2 rounded-xl border border-brand-purple/30 bg-slate-800/40 p-3 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="max-w-[120px] truncate text-xs font-bold text-white">{aiSuggested.title}</h4>
                    <div className="flex items-center text-[10px] font-bold text-brand-gold">
                      <Star className="mr-0.5 h-3 w-3 fill-brand-gold text-brand-gold" />
                      <span>{aiSuggested.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-light leading-normal text-slate-300 line-clamp-3">{aiSuggested.reason}</p>
                  <Link href={`/dashboard/movies/${aiSuggested.id}`} className="inline-block pt-1 text-[10px] font-bold text-brand-purple transition-colors hover:text-brand-blue">
                    View Details
                  </Link>
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
              {UPCOMING_MOVIES.map((m) => (
                <div key={m.title} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3">
                  <div className="max-w-[150px] space-y-0.5">
                    <h4 className="truncate text-[11px] font-bold text-white">{m.title}</h4>
                    <span className="text-[9px] font-semibold text-slate-500">{m.genre}</span>
                  </div>
                  <span className="rounded-lg border border-brand-gold/20 bg-brand-gold/15 px-2 py-1 text-center text-[9px] font-bold leading-none text-brand-gold">
                    {m.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
