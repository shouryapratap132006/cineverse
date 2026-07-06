"use client";

import React, {
  useState, useEffect, useRef, useCallback, Suspense
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft, Send, Loader2, SmilePlus, Paperclip, Image as ImageIcon,
  FileText, File, X, Reply, Palette, Check, CheckCheck, Download,
  Camera, Wallpaper
} from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { getMessages, sendMessage } from "@/actions/messages";
import { getSocket } from "@/lib/socket";
import { DEFAULT_AVATAR } from "@/lib/avatars";
import { format, isToday, isYesterday } from "date-fns";
import data from "@emoji-mart/data";

// Lazy-load emoji picker (large bundle)
const EmojiPicker = dynamic(() => import("@emoji-mart/react"), { ssr: false });

/* ─── Types ─────────────────────────────────────────────────── */
type Attachment = {
  type: "image" | "file" | "doc";
  name: string;
  url: string;
  size?: string;
};

type Reaction = { emoji: string; users: string[] };

type Msg = {
  id: string;
  content: string;
  senderId: string;
  sender: any;
  sentAt: string | Date;
  replyTo?: { id: string; content: string; senderName: string };
  reactions?: Reaction[];
  attachments?: Attachment[];
};

/* ─── Gradient background themes ─────────────────────────────── */
const GRADIENT_THEMES: { id: string; label: string; style: React.CSSProperties; preview: string }[] = [
  {
    id: "default",    label: "Dark Cosmos",
    style: { background: "#030712" },
    preview: "linear-gradient(135deg,#030712,#0f172a)"
  },
  {
    id: "midnight",   label: "Midnight Blue",
    style: { background: "linear-gradient(160deg, #0a0f1e 0%, #0d1b3e 100%)" },
    preview: "linear-gradient(135deg,#0a0f1e,#0d1b3e)"
  },
  {
    id: "forest",     label: "Deep Forest",
    style: { background: "linear-gradient(160deg, #071a0e 0%, #0d2a14 100%)" },
    preview: "linear-gradient(135deg,#071a0e,#0d2a14)"
  },
  {
    id: "crimson",    label: "Crimson Night",
    style: { background: "linear-gradient(160deg, #1a070a 0%, #2d0a0f 100%)" },
    preview: "linear-gradient(135deg,#1a070a,#2d0a0f)"
  },
  {
    id: "nebula",     label: "Nebula",
    style: { background: "linear-gradient(160deg, #0d001a 0%, #0a0520 50%, #000d1a 100%)" },
    preview: "linear-gradient(135deg,#0d001a,#0a0520,#000d1a)"
  },
  {
    id: "ocean",      label: "Deep Ocean",
    style: { background: "linear-gradient(160deg, #00111a 0%, #001428 100%)" },
    preview: "linear-gradient(135deg,#00111a,#001428)"
  },
  {
    id: "aurora",     label: "Aurora",
    style: { background: "linear-gradient(160deg, #001a14 0%, #000d1a 50%, #0d001a 100%)" },
    preview: "linear-gradient(135deg,#001a14,#000d1a,#0d001a)"
  },
  {
    id: "dusk",       label: "Dusk",
    style: { background: "linear-gradient(160deg, #1a0f00 0%, #0f0514 50%, #001a1a 100%)" },
    preview: "linear-gradient(135deg,#1a0f00,#0f0514,#001a1a)"
  },
];

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

function dateSeparator(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function ChatThread() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useCineverseAuth();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Feature state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<Msg | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [bgThemeId, setBgThemeId] = useState("default");
  const [bgCustomUrl, setBgCustomUrl] = useState<string | null>(null); // custom photo bg
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Derive current background style
  const currentTheme = GRADIENT_THEMES.find(t => t.id === bgThemeId) ?? GRADIENT_THEMES[0];
  const bgStyle: React.CSSProperties = bgCustomUrl
    ? { backgroundImage: `url(${bgCustomUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : currentTheme.style;

  /* ── Persist background ── */
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("cv-chat-bg-theme");
      const savedCustom = localStorage.getItem("cv-chat-bg-custom");
      if (savedTheme) setBgThemeId(savedTheme);
      if (savedCustom) setBgCustomUrl(savedCustom);
    } catch {}
  }, []);

  /* ── Load messages ── */
  useEffect(() => {
    getMessages(id).then(res => {
      if (res.success && res.messages) {
        setMessages(res.messages as unknown as Msg[]);
        const other = res.messages.find((m: any) => m.senderId !== user?.id)?.sender;
        if (other) setOtherUser(other);
      }
      setLoading(false);
    });
  }, [id, user?.id]);

  /* ── Socket ── */
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    socketRef.current = socket;
    socket.emit("register", user.id);
    socket.emit("join-conversation", id);

    socket.on("new-message", (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
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
      if (msg.senderId !== user.id && !otherUser) setOtherUser(msg.sender);
    });

    socket.on("user-typing", (d: { userId: string; username: string }) => {
      if (d.userId !== user.id) setTypingUser(d.username);
    });
    socket.on("user-stop-typing", (d: { userId: string }) => {
      if (d.userId !== user.id) setTypingUser(null);
    });

    return () => {
      socket.emit("leave-conversation", id);
      socket.off("new-message");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, [id, user?.id]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  /* ── Close emoji picker on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Typing ── */
  const handleTyping = (val: string) => {
    setText(val);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + "px";
    }
    if (!socketRef.current || !user?.id) return;
    socketRef.current.emit("typing", { conversationId: id, userId: user.id, username: user.username || "Someone" });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop-typing", { conversationId: id, userId: user.id });
    }, 1500);
  };

  /* ── File select (attachments) ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const docExts = ["pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx"];
      const detectedType: Attachment["type"] = type === "image" ? "image" : docExts.includes(ext) ? "doc" : "file";
      setAttachments(prev => [...prev, { type: detectedType, name: file.name, url, size: formatFileSize(file.size) }]);
    });
    e.target.value = "";
  };

  /* ── Custom background photo upload ── */
  const handleBgPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBgCustomUrl(dataUrl);
      try { localStorage.setItem("cv-chat-bg-custom", dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setShowBgPanel(false);
  };

  const clearCustomBg = () => {
    setBgCustomUrl(null);
    try { localStorage.removeItem("cv-chat-bg-custom"); } catch {}
  };

  const applyGradientTheme = (themeId: string) => {
    setBgThemeId(themeId);
    clearCustomBg();
    try { localStorage.setItem("cv-chat-bg-theme", themeId); } catch {}
    setShowBgPanel(false);
  };

  /* ── Send ── */
  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    if (sending) return;

    const content = text.trim();
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const savedReply = replyTo;
    const savedAttachments = [...attachments];
    setReplyTo(null);
    setAttachments([]);
    setShowEmojiPicker(false);

    socketRef.current?.emit("stop-typing", { conversationId: id, userId: user?.id });

    const tempMsg: Msg = {
      id: `temp-${Date.now()}`,
      content,
      senderId: user?.id ?? "",
      sender: { profile: { avatarUrl: user?.avatarUrl, username: user?.username } },
      sentAt: new Date().toISOString(),
      replyTo: savedReply
        ? { id: savedReply.id, content: savedReply.content, senderName: savedReply.sender?.profile?.username ?? "User" }
        : undefined,
      attachments: savedAttachments.length > 0 ? savedAttachments : undefined,
    };
    setMessages(prev => [...prev, tempMsg]);

    const res = await sendMessage(id, content);
    if (res.success && res.message) {
      socketRef.current?.emit("send-message", { conversationId: id, message: res.message });
      setMessages(prev =>
        prev.map(m =>
          m.id === tempMsg.id
            ? ({ ...res.message, replyTo: tempMsg.replyTo, attachments: tempMsg.attachments } as unknown as Msg)
            : m
        )
      );
    }
  }, [text, sending, id, user, replyTo, attachments]);

  /* ── Reaction ── */
  const handleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = m.reactions ? [...m.reactions] : [];
      const existing = reactions.find(r => r.emoji === emoji);
      if (existing) {
        const hasUser = existing.users.includes(user?.id ?? "");
        if (hasUser) {
          existing.users = existing.users.filter(u => u !== user?.id);
          if (existing.users.length === 0) return { ...m, reactions: reactions.filter(r => r.emoji !== emoji) };
        } else {
          existing.users = [...existing.users, user?.id ?? ""];
        }
      } else {
        reactions.push({ emoji, users: [user?.id ?? ""] });
      }
      return { ...m, reactions };
    }));
    setReactingTo(null);
    setHoveredMsg(null);
  };

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  // Group messages by date
  const grouped: { date: string; msgs: Msg[] }[] = [];
  messages.forEach(msg => {
    const d = dateSeparator(new Date(msg.sentAt as string | Date));
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.msgs.push(msg);
    else grouped.push({ date: d, msgs: [msg] });
  });

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden" style={bgStyle}>

      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          zIndex: 0
        }}
      />
      {/* Dim overlay when custom photo */}
      {bgCustomUrl && (
        <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ zIndex: 0 }} />
      )}

      {/* ── Chat Header ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-3 md:px-4 border-b border-white/8"
        style={{ height: "56px", background: "rgba(3,7,18,0.82)", backdropFilter: "blur(16px)", zIndex: 10 }}
      >
        {/* Back button — mobile */}
        <button
          onClick={() => router.push("/dashboard/messages")}
          className="md:hidden p-1.5 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/8 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* User info */}
        {otherUser ? (
          <Link href={`/dashboard/profile/${otherUser.id ?? ""}`} className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="relative shrink-0">
              <img
                src={otherUser.profile?.avatarUrl ?? DEFAULT_AVATAR}
                alt={otherUser.profile?.username}
                className="w-9 h-9 rounded-full object-cover border border-white/10"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#030712] rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white group-hover:text-brand-purple transition leading-none truncate">
                {otherUser.profile?.username ?? "User"}
              </p>
              <span className="text-[10px] font-semibold" style={{ color: typingUser ? "#a78bfa" : "#4ade80" }}>
                {typingUser ? `${typingUser} is typing…` : "Online"}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 shrink-0" />
            <p className="text-sm font-bold text-white">Conversation</p>
          </div>
        )}

        {/* Background change button — positioned carefully to avoid clashing with notifications */}
        <button
          onClick={() => setShowBgPanel(v => !v)}
          className={`shrink-0 p-2 rounded-xl transition ${showBgPanel ? "bg-brand-purple/20 text-brand-purple" : "text-slate-400 hover:text-white hover:bg-white/8"}`}
          title="Change chat background"
          id="chat-bg-btn"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>

      {/* ── Background Panel (slides in from right, fixed modal) ── */}
      {showBgPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowBgPanel(false)}
          />
          {/* Panel */}
          <div
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
            style={{
              width: "min(320px, 90vw)",
              background: "rgba(3,7,18,0.97)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">Chat Background</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Personalise your conversation</p>
              </div>
              <button
                onClick={() => setShowBgPanel(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Upload custom photo */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Custom Photo</p>
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/15 hover:border-brand-purple/50 text-slate-400 hover:text-white transition group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-brand-purple/10 transition shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold">Choose from Gallery</p>
                    <p className="text-[10px] text-slate-600">JPG, PNG, WEBP supported</p>
                  </div>
                </button>

                {bgCustomUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden aspect-video">
                    <img src={bgCustomUrl} alt="Custom BG" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                      <button
                        onClick={clearCustomBg}
                        className="px-3 py-1.5 bg-red-500/80 text-white text-xs font-bold rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-purple/80 rounded-full text-[9px] font-bold text-white">
                      Active
                    </div>
                  </div>
                )}
              </div>

              {/* Gradient themes */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Gradient Themes</p>
                <div className="grid grid-cols-2 gap-2">
                  {GRADIENT_THEMES.map(theme => {
                    const isActive = bgThemeId === theme.id && !bgCustomUrl;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => applyGradientTheme(theme.id)}
                        className={`relative rounded-xl overflow-hidden border-2 transition ${isActive ? "border-brand-purple" : "border-transparent hover:border-white/20"}`}
                        title={theme.label}
                      >
                        <div className="w-full aspect-video" style={{ background: theme.preview }} />
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-left">
                          <p className="text-[9px] font-semibold text-white truncate">{theme.label}</p>
                        </div>
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Messages scroll area ── */}
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-4 space-y-1" style={{ position: "relative", zIndex: 1 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ opacity: 0.5 }}>
            <SmilePlus className="w-10 h-10 text-slate-600" />
            <p className="text-sm text-slate-500">No messages yet. Say hello!</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.date} className="space-y-1">
            {/* Date separator */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/5" />
              <span
                className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: "rgba(3,7,18,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {group.date}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {group.msgs.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const prevMsg = group.msgs[i - 1];
              const nextMsg = group.msgs[i + 1];
              const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
              const isLast = !nextMsg || nextMsg.senderId !== msg.senderId;
              const isTemp = msg.id.startsWith("temp-");

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  onMouseEnter={() => setHoveredMsg(msg.id)}
                  onMouseLeave={() => { setHoveredMsg(null); setReactingTo(null); }}
                >
                  {/* Avatar */}
                  <div className="w-7 shrink-0 self-end mb-0.5">
                    {showAvatar && !isMe ? (
                      <img
                        src={msg.sender?.profile?.avatarUrl ?? DEFAULT_AVATAR}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-white/10"
                      />
                    ) : null}
                  </div>

                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[82%] md:max-w-[65%]`}>
                    {/* Sender name (others only) */}
                    {showAvatar && !isMe && (
                      <span className="text-[10px] font-bold text-brand-purple mb-0.5 px-1">
                        {msg.sender?.profile?.username ?? "User"}
                      </span>
                    )}

                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div
                        className={`flex items-start gap-2 px-3 py-1.5 rounded-xl mb-1 max-w-full border-l-2 border-brand-purple`}
                        style={{ background: "rgba(124,58,237,0.08)" }}
                      >
                        <Reply className="w-3 h-3 text-brand-purple shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-brand-purple truncate">{msg.replyTo.senderName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{msg.replyTo.content}</p>
                        </div>
                      </div>
                    )}

                    {/* Bubble + hover actions */}
                    <div className="relative group/bubble">
                      <div
                        className={`rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? `text-white ${isLast ? "rounded-br-sm" : ""} ${isTemp ? "opacity-70" : ""}`
                            : `text-slate-100 ${isLast ? "rounded-bl-sm" : ""}`
                        } ${msg.attachments && msg.attachments.length > 0 ? "p-2" : "px-4 py-2.5"}`}
                        style={
                          isMe
                            ? { background: "linear-gradient(135deg, #2563EB, #7C3AED)" }
                            : { background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.06)" }
                        }
                      >
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 mb-2">
                            {msg.attachments.map((att, ai) => (
                              <div key={ai}>
                                {att.type === "image" ? (
                                  <button
                                    onClick={() => setLightboxImg(att.url)}
                                    className="block rounded-xl overflow-hidden max-w-[240px] hover:opacity-90 transition"
                                  >
                                    <img src={att.url} alt={att.name} className="w-full object-cover rounded-xl max-h-64" />
                                  </button>
                                ) : (
                                  <div className="flex items-center gap-2 rounded-xl px-3 py-2 max-w-[240px]"
                                    style={{ background: "rgba(0,0,0,0.2)" }}>
                                    {att.type === "doc"
                                      ? <FileText className="w-5 h-5 text-brand-blue shrink-0" />
                                      : <File className="w-5 h-5 text-slate-400 shrink-0" />
                                    }
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-white truncate">{att.name}</p>
                                      {att.size && <p className="text-[10px] text-slate-400">{att.size}</p>}
                                    </div>
                                    <a href={att.url} download={att.name} className="shrink-0 text-slate-400 hover:text-white transition">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text */}
                        {msg.content && (
                          <span className={msg.attachments && msg.attachments.length > 0 ? "px-2 pb-1 block" : ""}>
                            {msg.content}
                          </span>
                        )}
                        {isTemp && (
                          <span className="inline-flex ml-1 align-middle opacity-60">
                            <Loader2 className="w-3 h-3 animate-spin" />
                          </span>
                        )}
                      </div>

                      {/* Hover actions — visible on hover */}
                      {hoveredMsg === msg.id && (
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 ${isMe ? "-left-[5.5rem]" : "-right-[5.5rem]"} z-20`}
                        >
                          <button
                            onClick={() => setReactingTo(reactingTo === msg.id ? null : msg.id)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-yellow-400 transition shadow-lg"
                            style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            <SmilePlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setReplyTo(msg); textareaRef.current?.focus(); }}
                            className="p-1.5 rounded-full text-slate-400 hover:text-brand-blue transition shadow-lg"
                            style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.1)" }}
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Quick reaction picker */}
                      {reactingTo === msg.id && (
                        <div
                          className={`absolute bottom-full mb-2 flex items-center gap-1 px-2.5 py-2 rounded-full shadow-2xl z-30 ${isMe ? "right-0" : "left-0"}`}
                          style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
                        >
                          {QUICK_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="text-xl hover:scale-125 transition-transform leading-none"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.filter(r => r.users.length > 0).length > 0 && (
                      <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                        {msg.reactions.filter(r => r.users.length > 0).map(r => (
                          <button
                            key={r.emoji}
                            onClick={() => handleReaction(msg.id, r.emoji)}
                            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition"
                            style={
                              r.users.includes(user?.id ?? "")
                                ? { background: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.4)", color: "#a78bfa" }
                                : { background: "rgba(30,41,59,0.8)", borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1" }
                            }
                          >
                            <span>{r.emoji}</span>
                            {r.users.length > 1 && <span className="text-[10px] font-semibold">{r.users.length}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp + tick */}
                    {isLast && (
                      <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "flex-row-reverse" : ""}`}>
                        <span className="text-[9px] text-slate-600">
                          {format(new Date(msg.sentAt as string | Date), "h:mm a")}
                        </span>
                        {isMe && !isTemp && <CheckCheck className="w-3 h-3 text-brand-blue" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-end gap-1.5">
            <div className="w-7 shrink-0" />
            <div
              className="px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2"
              style={{ background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* ── Emoji Picker (WhatsApp-style via emoji-mart) ── */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="shrink-0"
          style={{ zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <EmojiPicker
            data={data}
            onEmojiSelect={(emoji: any) => {
              setText(prev => prev + emoji.native);
              textareaRef.current?.focus();
            }}
            theme="dark"
            set="native"
            skinTonePosition="none"
            previewPosition="none"
            searchPosition="sticky"
            navPosition="top"
            perLine={8}
            maxFrequentRows={2}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 0,
              background: "rgba(8,12,24,0.97)",
              "--color-border": "rgba(255,255,255,0.05)",
              "--color-border-over": "rgba(255,255,255,0.1)",
              "--color-background": "rgba(8,12,24,0.97)",
              "--color-background-soft": "rgba(255,255,255,0.04)",
              "--color-background-sunken": "rgba(0,0,0,0.2)",
              "--shadow-color": "0,0,0",
              "--rgb-accent": "124,58,237",
              "--rgb-color": "248,250,252",
              "--rgb-input": "15,23,42",
            } as any}
          />
        </div>
      )}

      {/* ── Input area ── */}
      <div
        className="shrink-0"
        style={{ background: "rgba(3,7,18,0.90)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.06)", zIndex: 10 }}
      >
        {/* Reply banner */}
        {replyTo && (
          <div
            className="flex items-center gap-2 px-4 py-2 border-b border-white/5"
            style={{ background: "rgba(124,58,237,0.06)" }}
          >
            <Reply className="w-4 h-4 text-brand-purple shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-brand-purple">
                Replying to {replyTo.sender?.profile?.username ?? "User"}
              </p>
              <p className="text-xs text-slate-400 truncate">{replyTo.content || "📎 Attachment"}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white transition shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto border-b border-white/5 no-scrollbar">
            {attachments.map((att, i) => (
              <div key={i} className="relative shrink-0">
                {att.type === "image" ? (
                  <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                ) : (
                  <div
                    className="w-16 h-16 flex flex-col items-center justify-center rounded-xl border border-white/10 gap-1 p-1"
                    style={{ background: "rgba(30,41,59,0.8)" }}
                  >
                    {att.type === "doc"
                      ? <FileText className="w-5 h-5 text-brand-blue" />
                      : <File className="w-5 h-5 text-slate-400" />
                    }
                    <p className="text-[8px] text-slate-400 text-center truncate w-full px-1">{att.name}</p>
                  </div>
                )}
                <button
                  onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 px-3 md:px-4 py-3">
          {/* Left buttons */}
          <div className="flex items-center gap-0.5 shrink-0 pb-1">
            {/* Emoji */}
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              className={`p-2 rounded-xl transition ${showEmojiPicker ? "text-brand-purple" : "text-slate-400 hover:text-yellow-400 hover:bg-white/5"}`}
              title="Emoji"
            >
              <SmilePlus className="w-5 h-5" />
            </button>

            {/* Attach — hover reveals sub-menu */}
            <div className="relative group/attach">
              <button
                className="p-2 text-slate-400 hover:text-brand-blue hover:bg-white/5 rounded-xl transition"
                title="Attach"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              {/* Sub-menu */}
              <div
                className="absolute bottom-full left-0 mb-2 hidden group-hover/attach:flex flex-col gap-1 p-2 rounded-xl shadow-2xl min-w-[160px] z-50"
                style={{
                  background: "rgba(10,14,28,0.97)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                    <ImageIcon className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  Photo / Video
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.15)" }}>
                    <FileText className="w-3.5 h-3.5 text-brand-blue" />
                  </div>
                  Document
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white rounded-lg transition"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(100,116,139,0.15)" }}>
                    <File className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  File
                </button>
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div
            className="flex-1 rounded-2xl transition focus-within:ring-1 focus-within:ring-brand-purple/40 overflow-hidden"
            style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => handleTyping(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              className="w-full bg-transparent text-white text-sm py-2.5 px-4 resize-none outline-none placeholder-slate-500 leading-relaxed"
              style={{ maxHeight: "128px", minHeight: "40px" }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
          </div>

          {/* Send */}
          <button
            onClick={() => handleSend()}
            disabled={!text.trim() && attachments.length === 0}
            className="shrink-0 p-3 text-white rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input ref={imageInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={e => handleFileSelect(e, "image")} />
        <input ref={fileInputRef} type="file" multiple hidden onChange={e => handleFileSelect(e, "file")} />
        <input ref={bgInputRef} type="file" accept="image/*" hidden onChange={handleBgPhotoSelect} />
      </div>

      {/* ── Image Lightbox ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/10 transition"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxImg}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
