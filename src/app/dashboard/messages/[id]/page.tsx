"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, SmilePlus } from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { getMessages, sendMessage } from "@/actions/messages";
import { getSocket } from "@/lib/socket";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { format, isToday, isYesterday } from "date-fns";

function dateSeparator(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export default function ChatThread() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useCineverseAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Load messages + derive other user
  useEffect(() => {
    getMessages(id).then(res => {
      if (res.success && res.messages) {
        setMessages(res.messages);
        // Derive other user from first message that isn't ours
        const other = res.messages.find((m: any) => m.senderId !== user?.id)?.sender;
        if (other) setOtherUser(other);
      }
      setLoading(false);
    });
  }, [id, user?.id]);

  // Socket.io setup
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("register", user.id);
    socket.emit("join-conversation", id);

    socket.on("new-message", (msg: any) => {
      setMessages(prev => {
        // Deduplicate — replace temp optimistic message if same content+sender within 5s
        const isDupe = prev.some(m => m.id === msg.id);
        if (isDupe) return prev;
        // Replace optimistic temp message
        const tempIdx = prev.findIndex(
          m => m.id.startsWith("temp-") && m.senderId === msg.senderId && m.content === msg.content
        );
        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = msg;
          return next;
        }
        return [...prev, msg];
      });
      // Update other user info if we don't have it yet
      if (msg.senderId !== user.id && !otherUser) {
        setOtherUser(msg.sender);
      }
    });

    socket.on("user-typing", (data: { userId: string; username: string }) => {
      if (data.userId !== user.id) setTypingUser(data.username);
    });

    socket.on("user-stop-typing", (data: { userId: string }) => {
      if (data.userId !== user.id) setTypingUser(null);
    });

    return () => {
      socket.emit("leave-conversation", id);
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [id, user?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTyping = (val: string) => {
    setText(val);
    if (!socketRef.current || !user?.id) return;
    socketRef.current.emit("typing", {
      conversationId: id,
      userId: user.id,
      username: user.username || "Someone",
    });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { conversationId: id, userId: user.id });
    }, 1500);
  };

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;

    const content = text.trim();
    setText("");
    setSending(false);

    // Stop typing indicator
    socketRef.current?.emit("stop-typing", { conversationId: id, userId: user?.id });

    // Optimistic message
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      senderId: user?.id,
      sender: { profile: { avatarUrl: user?.avatarUrl, username: user?.username } },
      sentAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await sendMessage(id, content);
    if (res.success && res.message) {
      // Emit via socket so other participants get it instantly
      socketRef.current?.emit("send-message", {
        conversationId: id,
        message: res.message,
      });
      // Replace temp with real
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m));
    }
  }, [text, sending, id, user]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  // Group messages by date
  const grouped: { date: string; msgs: any[] }[] = [];
  messages.forEach(msg => {
    const d = dateSeparator(new Date(msg.sentAt));
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(msg);
    else grouped.push({ date: d, msgs: [msg] });
  });

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col bg-slate-950/40">

      {/* Header */}
      <div className="h-14 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center gap-3 px-4 shrink-0">
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="md:hidden p-1.5 text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {otherUser ? (
          <Link href={`/dashboard/profile/${otherUser.id || ""}`} className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={otherUser.profile?.avatarUrl || DEFAULT_AVATAR}
                alt={otherUser.profile?.username}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-brand-purple transition leading-none">
                {otherUser.profile?.username || "User"}
              </p>
              <span className="text-[10px] text-green-400 font-semibold">Online</span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10" />
            <p className="text-sm font-bold text-white">Conversation</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <SmilePlus className="w-10 h-10 text-slate-600" />
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.date} className="space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{group.date}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {group.msgs.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const prevMsg = group.msgs[i - 1];
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isTemp = msg.id.startsWith("temp-");

              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Avatar */}
                  <div className="w-7 shrink-0">
                    {showAvatar && !isMe && (
                      <img
                        src={msg.sender?.profile?.avatarUrl || DEFAULT_AVATAR}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                    )}
                  </div>

                  <div className={`flex flex-col max-w-[72%] ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? `bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-br-sm ${isTemp ? "opacity-60" : ""}`
                        : "bg-slate-800 text-slate-100 border border-white/5 rounded-bl-sm"
                    }`}>
                      {msg.content}
                    </div>
                    {showAvatar && (
                      <span className="text-[9px] text-slate-600 mt-1 px-1">
                        {format(new Date(msg.sentAt), "h:mm a")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-end gap-2">
            <div className="w-7 shrink-0" />
            <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-slate-800 border border-white/5 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 italic">{typingUser} is typing</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl focus-within:border-brand-purple/50 transition">
            <textarea
              value={text}
              onChange={e => handleTyping(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent text-white text-sm py-3 px-4 resize-none outline-none max-h-32 placeholder-slate-500"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-3 bg-brand-purple hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition active:scale-95 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
