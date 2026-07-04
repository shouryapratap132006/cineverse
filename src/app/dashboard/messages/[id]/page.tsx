"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Info, Send, Phone, Video, MoreVertical, Image as ImageIcon } from "lucide-react";
import { useCineverseAuth } from "@/components/provider";
import { getMessages, sendMessage } from "@/actions/messages";
import { pusherClient } from "@/lib/pusher-client";

export default function ChatThread() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useCineverseAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(id).then(res => {
      if (res.success && res.messages) setMessages(res.messages);
      setLoading(false);
    });

    if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const channel = pusherClient.subscribe(`chat-${id}`);
      channel.bind("new-message", (data: any) => {
        setMessages((prev) => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
      });

      return () => {
        pusherClient.unsubscribe(`chat-${id}`);
      };
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempId,
      content,
      senderId: user?.id,
      sender: { profile: { avatarUrl: user?.avatarUrl } },
      sentAt: new Date().toISOString()
    }]);

    await sendMessage(id, content);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950/40">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-slate-950/40 relative">
      
      {/* Header */}
      <div className="h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.push("/dashboard/messages")} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden">
              {/* Profile Image (derive from other user) */}
              <div className="w-full h-full bg-gradient-to-tr from-brand-blue to-brand-purple opacity-50"></div>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Conversation</h3>
              <span className="text-[10px] text-green-400 font-semibold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 block" />
                <span>Online</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-slate-400">
          <button className="p-2 hover:bg-white/5 rounded-lg transition"><Phone className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition"><Video className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition"><Info className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          const showAvatar = i === 0 || messages[i-1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[70%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar Space */}
                <div className={`w-8 shrink-0 flex flex-col justify-end ${isMe ? "ml-3" : "mr-3"}`}>
                  {showAvatar && !isMe && (
                    <img src={msg.sender?.profile?.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  )}
                </div>

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? "bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-br-sm" 
                      : "bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                  {showAvatar && (
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/90 border-t border-white/5 backdrop-blur-md">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end space-x-2">
          <button type="button" className="p-3 text-slate-400 hover:text-white transition rounded-xl hover:bg-white/5 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl relative focus-within:border-brand-purple/50 transition">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-transparent text-white text-sm py-3 px-4 resize-none outline-none max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-brand-purple hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-brand-purple text-white rounded-xl shrink-0 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
