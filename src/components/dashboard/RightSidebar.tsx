"use client";

import React, { useState } from "react";
import { Bell, UserPlus, Flame, Calendar, Check, X, Star } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const NOTIFICATIONS = [
  { id: "n1", text: "Clara liked your review on Parasite.", time: "10m ago" },
  { id: "n2", text: "Directing101 commented on your post.", time: "1h ago" }
];

const FRIEND_REQUESTS = [
  { id: "fr1", name: "CinephileClara", handle: "@clara_reviews", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }
];

const TRENDING_CLUBS = [
  { id: "tc1", name: "Sci-Fi Odyssey", members: "2.4K", cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100" },
  { id: "tc2", name: "Ghibli Magic", members: "1.8K", cover: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100" }
];

const UPCOMING_MOVIES = [
  { title: "Blade Runner 2099", date: "July 24", genre: "Sci-Fi" },
  { title: "Nolan's Next Project", date: "August 12", genre: "Thriller" }
];

export default function RightSidebar() {
  const [requests, setRequests] = useState(FRIEND_REQUESTS);
  const [joinedClubs, setJoinedClubs] = useState<Record<string, boolean>>({});

  const handleRequestResponse = (id: string, accept: boolean) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    // Trigger notification or local state change
  };

  const toggleClub = (id: string) => {
    setJoinedClubs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-80 h-screen fixed top-0 right-0 bg-slate-950/40 border-l border-white/5 backdrop-blur-xl p-6 hidden xl:flex flex-col space-y-6 overflow-y-auto z-40 scrollbar-thin">
      
      {/* Notifications */}
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
          <Bell className="w-3.5 h-3.5 text-brand-purple" />
          <span>Notifications</span>
        </h3>
        <div className="space-y-2">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="p-3 bg-white/3 border border-white/5 rounded-xl space-y-0.5 hover:bg-white/5 transition">
              <p className="text-[11px] text-slate-200 leading-normal">{n.text}</p>
              <span className="text-[9px] text-slate-500 font-semibold">{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
            <UserPlus className="w-3.5 h-3.5 text-brand-blue" />
            <span>Friend Requests</span>
          </h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="p-3.5 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  <div className="space-y-0.5 truncate max-w-[100px]">
                    <h4 className="text-[11px] font-bold text-white truncate">{r.name}</h4>
                    <span className="text-[9px] text-slate-500 truncate block">{r.handle}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleRequestResponse(r.id, true)}
                    className="p-1 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRequestResponse(r.id, false)}
                    className="p-1 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-400 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Clubs */}
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Suggested Clubs</span>
        </h3>
        <div className="space-y-2.5">
          {TRENDING_CLUBS.map((club) => (
            <div key={club.id} className="flex items-center justify-between p-1 bg-white/2 border border-transparent hover:border-white/5 rounded-xl transition">
              <div className="flex items-center space-x-2.5">
                <img src={club.cover} alt={club.name} className="w-9 h-9 object-cover rounded-lg border border-white/10" />
                <div>
                  <h4 className="text-[11px] font-bold text-white">{club.name}</h4>
                  <span className="text-[9px] text-slate-500 font-semibold">{club.members} members</span>
                </div>
              </div>
              <button
                onClick={() => toggleClub(club.id)}
                className={`py-1 px-2.5 rounded-lg text-[9px] font-bold border transition duration-200 cursor-pointer ${
                  joinedClubs[club.id]
                    ? "bg-emerald-500/20 border-emerald-500/20 text-emerald-400"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                }`}
              >
                {joinedClubs[club.id] ? "Joined" : "Join"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Movies */}
      <div className="space-y-3.5 pt-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-brand-gold" />
          <span>Release Calendar</span>
        </h3>
        <div className="space-y-2.5">
          {UPCOMING_MOVIES.map((m) => (
            <div key={m.title} className="p-3 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between">
              <div className="space-y-0.5 max-w-[150px]">
                <h4 className="text-[11px] font-bold text-white truncate">{m.title}</h4>
                <span className="text-[9px] text-slate-500 font-semibold">{m.genre}</span>
              </div>
              <span className="px-2 py-1 rounded-lg bg-brand-gold/15 text-brand-gold border border-brand-gold/20 text-[9px] font-bold text-center leading-none">
                {m.date}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
