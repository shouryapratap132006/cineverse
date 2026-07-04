"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, UserPlus, Flame, Calendar, Check, X } from "lucide-react";
import { getSuggestedUsers } from "@/actions/profile";
import { getNotifications, markNotificationRead } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";

const UPCOMING_MOVIES = [
  { title: "Blade Runner 2099", date: "July 24", genre: "Sci-Fi" },
  { title: "Nolan's Next Project", date: "August 12", genre: "Thriller" }
];

export default function RightSidebar() {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real data
    getSuggestedUsers().then(res => {
      if (res.success && res.users) setSuggestedUsers(res.users);
    });

    getNotifications(1, 5).then(res => {
      if (res.success && res.notifications) setNotifications(res.notifications);
    });
  }, []);

  const handleReadNotification = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <aside className="w-80 h-screen fixed top-0 right-0 bg-slate-950/40 border-l border-white/5 backdrop-blur-xl p-6 hidden xl:flex flex-col space-y-6 overflow-y-auto z-40 scrollbar-thin">
      
      {/* Notifications */}
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
          <Bell className="w-3.5 h-3.5 text-brand-purple" />
          <span>Recent Activity</span>
        </h3>
        <div className="space-y-2">
          {notifications.length > 0 ? notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => handleReadNotification(n.id)}
              className={`p-3 border rounded-xl space-y-0.5 transition cursor-pointer ${n.isRead ? "bg-white/3 border-white/5 hover:bg-white/5" : "bg-brand-purple/10 border-brand-purple/30 hover:bg-brand-purple/20"}`}
            >
              <p className="text-[11px] text-slate-200 leading-normal">
                <span className="font-bold text-white mr-1">{n.actor?.profile?.username || "Someone"}</span>
                {n.type === "LIKE" ? "reacted to your post." :
                 n.type === "COMMENT" ? "commented on your post." :
                 n.type === "MENTION" ? "mentioned you." :
                 n.type === "FRIEND_REQUEST" ? "sent you a friend request." :
                 n.type === "ACCEPTED" ? "accepted your friend request." : "interacted with you."}
              </p>
              <span className="text-[9px] text-slate-500 font-semibold">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </span>
            </div>
          )) : (
            <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-center">
              <span className="text-xs text-slate-500">No new notifications.</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center space-x-2">
          <UserPlus className="w-3.5 h-3.5 text-brand-blue" />
          <span>Suggested Critics</span>
        </h3>
        <div className="space-y-2">
          {suggestedUsers.length > 0 ? suggestedUsers.map((u) => (
            <div key={u.id} className="p-3 bg-white/3 border border-white/5 rounded-xl flex items-center justify-between">
              <Link href={`/dashboard/profile/${u.id}`} className="flex items-center space-x-2.5 group">
                <img src={u.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/10 group-hover:border-brand-purple transition" />
                <div className="space-y-0.5 truncate max-w-[100px]">
                  <h4 className="text-[11px] font-bold text-white truncate group-hover:text-brand-blue transition">{u.profile?.username || "Unknown"}</h4>
                  <span className="text-[9px] text-slate-500 truncate block">{u._count?.followers || 0} followers</span>
                </div>
              </Link>
              <Link
                href={`/dashboard/profile/${u.id}`}
                className="p-1.5 rounded-md bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </Link>
            </div>
          )) : (
            <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-center">
              <span className="text-xs text-slate-500">No suggestions right now.</span>
            </div>
          )}
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
