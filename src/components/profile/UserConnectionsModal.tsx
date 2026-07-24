"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Users, UserCheck, UserPlus, Check, UserMinus, Loader2 } from "lucide-react";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import {
  getUserFollowers,
  getUserFollowing,
  getUserFriends,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/actions/friends";

interface UserConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  initialTab?: "followers" | "following" | "friends" | "requests";
  isSelf?: boolean;
}

export default function UserConnectionsModal({
  isOpen,
  onClose,
  targetUserId,
  initialTab = "followers",
  isSelf = false,
}: UserConnectionsModalProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following" | "friends" | "requests">(initialTab);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoading(true);
      if (activeTab === "followers") {
        const res = await getUserFollowers(targetUserId);
        if (res.success) setUsers(res.users);
      } else if (activeTab === "following") {
        const res = await getUserFollowing(targetUserId);
        if (res.success) setUsers(res.users);
      } else if (activeTab === "friends") {
        const res = await getUserFriends(targetUserId);
        if (res.success) setUsers(res.users);
      } else if (activeTab === "requests") {
        const res = await getPendingFriendRequests();
        if (res.success) setPendingRequests(res.requests);
      }
      setLoading(false);
    };

    loadData();
  }, [isOpen, activeTab, targetUserId]);

  if (!isOpen) return null;

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId);
    await acceptFriendRequest(requestId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    setActionLoading(null);
  };

  const handleReject = async (requestId: string) => {
    setActionLoading(requestId);
    await rejectFriendRequest(requestId);
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
    setActionLoading(null);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-purple" />
            Social Connections
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
          {(["followers", "following", "friends"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-brand-purple text-white shadow-lg"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
          {isSelf && (
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === "requests"
                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-lg"
                  : "bg-white/5 text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              Requests
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-6 h-6 text-brand-purple animate-spin" />
            </div>
          ) : activeTab === "requests" ? (
            pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No pending friend requests</div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition"
                >
                  <Link
                    href={`/dashboard/profile/${req.sender?.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <img
                      src={req.sender?.profile?.avatarUrl || DEFAULT_AVATAR}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {req.sender?.profile?.username || "Cinephile"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">Wants to connect with you</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white text-xs font-bold hover:brightness-110 transition flex items-center gap-1 shadow-md disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-bold hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm capitalize">No {activeTab} yet</div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition"
              >
                <Link
                  href={`/dashboard/profile/${u.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0"
                >
                  <img
                    src={u.profile?.avatarUrl || DEFAULT_AVATAR}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{u.profile?.username || "Cinephile"}</p>
                    <p className="text-xs text-slate-500 truncate">{u.profile?.bio || "Film Enthusiast"}</p>
                  </div>
                </Link>

                <Link
                  href={`/dashboard/profile/${u.id}`}
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 hover:text-white transition shrink-0"
                >
                  View Profile
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
