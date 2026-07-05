"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Search, Plus, MoreVertical } from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { getConversations } from "@/actions/messages";
import GlassCard from "@/components/shared/GlassCard";

export default function MessagesIndex() {
  const { user } = useCineverseAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations().then(res => {
      if (res.success && res.conversations && res.conversations.length > 0) {
        setConversations(res.conversations);
      } else {
        setConversations([
          {
            id: "demo-1",
            users: [{ id: "demo-u-1", profile: { username: "Maya", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" } }],
            messages: [{ content: "Ready for tonight's watch party?", sentAt: new Date().toISOString() }],
          },
          {
            id: "demo-2",
            users: [{ id: "demo-u-2", profile: { username: "Jules", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" } }],
            messages: [{ content: "I just watched Dune again.", sentAt: new Date().toISOString() }],
          },
        ]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="w-full h-screen flex">
      
      {/* Sidebar Inbox List */}
      <div className="w-full md:w-[380px] h-full border-r border-white/5 bg-slate-950/80 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display font-extrabold text-2xl text-white">Messages</h1>
            <button className="p-2 bg-brand-blue/20 hover:bg-brand-blue/30 text-brand-blue rounded-xl transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-brand-purple transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const otherUser = conv.users.find((u: any) => u.id !== user?.id) || conv.users[0];
              const lastMessage = conv.messages?.[0];
              return (
                <Link key={conv.id} href={`/dashboard/messages/${conv.id}`} className="block">
                  <div className="p-3 rounded-xl hover:bg-white/5 border border-transparent transition flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <img src={otherUser?.profile?.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-brand-purple transition" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">{otherUser?.profile?.username || "Unknown"}</h4>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {lastMessage ? new Date(lastMessage.sentAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {lastMessage ? lastMessage.content : "No messages yet."}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area (Empty State for Index) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-900/40 relative">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-4 border-slate-900 shadow-xl">
            <MessageSquare className="w-8 h-8 text-brand-blue" />
          </div>
          <h2 className="text-xl font-bold text-white">Your Messages</h2>
          <p className="text-sm text-slate-400">Select a conversation or start a new one.</p>
        </div>
      </div>

    </div>
  );
}
