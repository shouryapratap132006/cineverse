"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Globe, Compass, Bookmark, Star, MessageSquare, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/ai", icon: Sparkles, label: "AI" },
  { href: "/dashboard/search", icon: Search, label: "Search" },
  { href: "/dashboard/community", icon: Globe, label: "Community" },
  { href: "/dashboard/watchlist", icon: Bookmark, label: "Watchlist" },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Messages" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 border-t border-white/8 backdrop-blur-xl">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0",
                isActive ? "text-brand-purple" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "drop-shadow-[0_0_6px_rgba(124,58,237,0.8)]")} />
              <span className={cn("text-[9px] font-bold truncate", isActive ? "text-brand-purple" : "text-slate-600")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
