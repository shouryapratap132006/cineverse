import React from "react";
import { getFeed } from "@/actions/social";
import Feed from "@/components/social/Feed";
import Composer from "@/components/social/Composer";
import { Users, Hash } from "lucide-react";

export const metadata = {
  title: "Community | CineVerse",
  description: "Connect with cinephiles, share reviews, and join the conversation.",
};

export default async function CommunityPage() {
  const feedRes = await getFeed(1, 20);
  const initialPosts = feedRes.success ? feedRes.posts : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-brand-purple">
            <Users className="w-6 h-6" />
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">Community Feed</h1>
          </div>
          <p className="text-sm text-slate-400">Share your thoughts, reviews, and discover what others are watching.</p>
        </div>
        
        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/50 border border-white/5 rounded-lg p-1 text-xs font-semibold">
          <button className="px-4 py-2 rounded-md bg-brand-purple text-white shadow-lg">For You</button>
          <button className="px-4 py-2 rounded-md text-slate-400 hover:text-white transition">Following</button>
          <button className="px-4 py-2 rounded-md text-slate-400 hover:text-white transition flex items-center space-x-1">
            <Hash className="w-3.5 h-3.5" />
            <span>Trending</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          <Composer />
          <Feed initialPosts={initialPosts} />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Suggested Cinephiles</h3>
            {/* Mock suggested users for now */}
            {[
              { name: "Christopher N.", handle: "@nolanite", rep: "Gold Star" },
              { name: "Mia T.", handle: "@miamoore", rep: "Silver Star" },
              { name: "David F.", handle: "@fincherfan", rep: "Bronze Star" },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10" />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-white">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.handle}</p>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full bg-white/5 hover:bg-brand-purple/20 text-brand-purple border border-brand-purple/20 text-[10px] font-bold transition">
                  Follow
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Trending Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["#DunePartTwo", "#Oscars2026", "#SciFiMasterpiece", "#A24", "#HorrorMovies"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] text-slate-300 hover:bg-white/10 cursor-pointer transition">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
