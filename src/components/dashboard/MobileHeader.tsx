"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount, getNotifications, markNotificationRead } from "@/actions/notifications";
import { formatDistanceToNow } from "date-fns";

export default function MobileHeader() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    getUnreadNotificationCount().then(r => setUnread(r.count));
  }, []);

  const handleOpen = async () => {
    if (!open) {
      const res = await getNotifications(1, 8);
      if (res.success && res.notifications) setNotifications(res.notifications);
    }
    setOpen(o => !o);
  };

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <>
      <div className="lg:hidden h-14 bg-slate-950/80 border-b border-white/5 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
        <span className="font-display font-extrabold text-sm tracking-wider text-white">
          Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
        </span>

        <button
          onClick={handleOpen}
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-purple text-[9px] font-bold text-white flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </div>

      {/* Notification dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed top-14 right-3 z-50 w-80 max-w-[calc(100vw-1.5rem)] bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] text-brand-purple font-bold">{unread} unread</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No notifications yet.</p>
              ) : (
                notifications.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleRead(n.id)}
                    className={`w-full text-left px-4 py-3 transition ${n.isRead ? "hover:bg-white/3" : "bg-brand-purple/8 hover:bg-brand-purple/15"}`}
                  >
                    <p className="text-[11px] text-slate-200 leading-snug">
                      <span className="font-bold text-white">{n.actor?.profile?.username || "Someone"}</span>
                      {" "}
                      {n.type === "LIKE" ? "reacted to your post."
                        : n.type === "COMMENT" ? "commented on your post."
                        : n.type === "MENTION" ? "mentioned you."
                        : n.type === "FRIEND_REQUEST" ? "sent you a friend request."
                        : n.type === "ACCEPTED" ? "accepted your friend request."
                        : "interacted with you."}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-0.5 block">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
