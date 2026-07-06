"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Search, Plus, X, Loader2, ArrowLeft } from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { getConversations, searchUsers, getOrCreateConversation } from "@/actions/messages";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { formatDistanceToNow } from "date-fns";

export default function MessagesIndex() {
  const { user } = useCineverseAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // New conversation modal
  const [showNew, setShowNew] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getConversations().then(res => {
      if (res.success) setConversations(res.conversations || []);
      setLoading(false);
    });
  }, []);

  // Debounced user search
  useEffect(() => {
    if (!userQuery.trim()) { setUserResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(userQuery);
      setUserResults(res.users || []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [userQuery]);

  const handleStartConversation = async (targetUserId: string) => {
    setStarting(true);
    const res = await getOrCreateConversation(targetUserId);
    if (res.success && res.conversation) {
      router.push(`/dashboard/messages/${res.conversation.id}`);
    }
    setStarting(false);
    setShowNew(false);
  };

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const other = c.users?.find((u: any) => u.id !== user?.id) || c.users?.[0];
    return other?.profile?.username?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-full h-full flex" style={{ overflow: "hidden" }}>

      {/* ── Inbox sidebar ── */}
      <div className="w-full md:w-[360px] h-full border-r border-white/5 bg-slate-950/90 backdrop-blur-xl flex flex-col shrink-0">

        {/* Header */}
        <div className="p-4 border-b border-white/5 space-y-3 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-extrabold text-xl text-white tracking-tight">Messages</h1>
            <button
              onClick={() => setShowNew(true)}
              className="p-2 bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue rounded-xl transition flex items-center gap-1.5"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">New</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/8 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-purple/40 transition"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-600 mt-1">Start chatting with someone</p>
              </div>
              <button
                onClick={() => setShowNew(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-xs font-bold hover:opacity-90 transition shadow-lg"
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filtered.map(conv => {
              const other = conv.users?.find((u: any) => u.id !== user?.id) || conv.users?.[0];
              const last = conv.messages?.[0];
              return (
                <Link key={conv.id} href={`/dashboard/messages/${conv.id}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition group cursor-pointer">
                    <div className="relative shrink-0">
                      <img
                        src={other?.profile?.avatarUrl || DEFAULT_AVATAR}
                        alt={other?.profile?.username}
                        className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-brand-purple/30 transition"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white truncate">
                          {other?.profile?.username || "Unknown"}
                        </span>
                        {last && (
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {formatDistanceToNow(new Date(last.sentAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                       <p className="text-xs text-slate-400 truncate mt-0.5">
                        {(() => {
                          if (!last) return "Say hello 👋";
                          let text = last.content;
                          if (text && text.startsWith("{") && text.endsWith("}")) {
                            try {
                              const parsed = JSON.parse(text);
                              if (parsed.attachments && parsed.attachments.length > 0) {
                                return "📎 Attachment";
                              }
                              return parsed.text || "";
                            } catch (e) {}
                          }
                          return text || "Say hello 👋";
                        })()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* ── Empty state for desktop ── */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950 gap-5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-blue blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-brand-purple blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-white/10 flex items-center justify-center shadow-2xl">
            <MessageSquare className="w-9 h-9 text-brand-blue" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Your Messages</h2>
            <p className="text-sm text-slate-400 mt-1.5">Select a conversation or start a new one.</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white text-sm font-bold hover:opacity-90 transition shadow-xl"
          >
            <Plus className="w-4 h-4" /> New Message
          </button>
        </div>
      </div>

      {/* ── New conversation modal ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <h3 className="text-sm font-bold text-white">New Conversation</h3>
              <button
                onClick={() => { setShowNew(false); setUserQuery(""); setUserResults([]); }}
                className="text-slate-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  autoFocus
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-purple/50 transition"
                />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple animate-spin" />}
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {userResults.length === 0 && userQuery.length > 0 && !searching && (
                  <p className="text-center text-xs text-slate-500 py-8">No users found for "{userQuery}"</p>
                )}
                {!userQuery && (
                  <p className="text-center text-xs text-slate-600 py-8">Type a username to search CineVerse users</p>
                )}
                {userResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u.id)}
                    disabled={starting}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left group"
                  >
                    <img
                      src={u.profile?.avatarUrl || DEFAULT_AVATAR}
                      alt={u.profile?.username}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white group-hover:text-brand-purple transition truncate">
                        {u.profile?.username || u.email}
                      </p>
                      {u.profile?.bio && (
                        <p className="text-xs text-slate-500 truncate">{u.profile.bio}</p>
                      )}
                    </div>
                    {starting ? (
                      <Loader2 className="w-4 h-4 text-brand-purple animate-spin shrink-0" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-slate-600 group-hover:text-brand-purple transition shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
