"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCineverseAuth } from "@/components/provider";
import { Film, Home, Compass, Bookmark, Star, User, Settings, LogOut, Search, Globe, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuth } from "@clerk/nextjs";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut: mockSignOut, user } = useCineverseAuth();
  const { signOut: clerkSignOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Search", href: "/dashboard/search", icon: Search },
    { name: "Communities", href: "/dashboard/community", icon: Globe },
    { name: "Discover", href: "/dashboard/discover", icon: Compass },
    { name: "Watchlist", href: "/dashboard/watchlist", icon: Bookmark },
    { name: "Reviews", href: "/dashboard/reviews", icon: Star },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const handleSignOut = async () => {
    // Attempt real Clerk signout if available, fallback to mock
    if (clerkSignOut) {
      await clerkSignOut();
    } else {
      mockSignOut();
    }
    router.push("/");
  };

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 bg-slate-950/80 border-r border-white/5 backdrop-blur-xl flex flex-col justify-between p-6 z-40">
      
      {/* Brand Header */}
      <div className="space-y-8">
        <Link href="/" className="flex items-center space-x-2.5 group pl-2">
          <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-white">
            <Film className="w-5 h-5 text-brand-purple" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-wider text-white">
            Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Verse</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = mounted && pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition duration-200 cursor-pointer group",
                  isActive
                    ? "bg-gradient-to-r from-brand-blue/15 to-brand-purple/15 border-l-4 border-brand-purple text-white shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 group-hover:scale-105 transition", isActive ? "text-brand-purple" : "text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Actions */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 px-2">
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          <div className="space-y-0.5 truncate">
            <h4 className="text-xs font-bold text-white leading-none truncate">{user?.username || "cinephile"}</h4>
            <span className="text-[9px] text-slate-500 font-semibold truncate block">{user?.email || "cinephile@cineverse.com"}</span>
          </div>
        </div>

        <hr className="border-white/5" />

        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3.5 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
