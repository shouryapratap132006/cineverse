"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_COMMUNITY_POSTS, MOCK_CLUBS } from "@/lib/mockData";
import { MessageSquare, Heart, Users, ChevronRight, Plus, Star, Vote, Check } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const INITIAL_POLL = {
  question: "What is Christopher Nolan's absolute masterpiece?",
  options: [
    { id: "o1", text: "Interstellar (2014)", votes: 1240 },
    { id: "o2", text: "Inception (2010)", votes: 980 },
    { id: "o3", text: "The Dark Knight (2008)", votes: 1420 },
    { id: "o4", text: "Memento (2000)", votes: 410 }
  ]
};

const SUGGESTED_USERS = [
  { name: "CinephileClara", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", handle: "@clara_reviews" },
  { name: "DesertWalker", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", handle: "@dune_stan" },
  { name: "NolanGeek", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", handle: "@nolan_only" }
];

export default function CommunitySection() {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likedCounts, setLikedCounts] = useState<Record<string, number>>(
    MOCK_COMMUNITY_POSTS.reduce((acc, post) => ({ ...acc, [post.id]: post.likes }), {})
  );
  
  // Poll States
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState(INITIAL_POLL.options);
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});

  const handleLike = (id: string) => {
    setLikes((prev) => {
      const isLiked = !prev[id];
      setLikedCounts((prevCounts) => ({
        ...prevCounts,
        [id]: isLiked ? prevCounts[id] + 1 : prevCounts[id] - 1
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  const handleVote = (optionId: string) => {
    if (votedOption) return;
    setVotedOption(optionId);
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  };

  const toggleFollow = (name: string) => {
    setFollowedUsers((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const totalVotes = pollOptions.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <section id="community" className="py-24 relative z-10 bg-slate-950/20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white">
            Where Cinema Meets{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Community.
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 font-light leading-relaxed">
            Discuss plot holes, join dedicated weekly movie clubs, vote on trending cinemathreads, and track what your friends are watching.
          </p>
        </div>

        {/* Community Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Community Discussions Feed (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg text-white">Discussion Feed</h3>
              <span className="text-xs text-slate-500 font-medium">Recent Activity</span>
            </div>

            {MOCK_COMMUNITY_POSTS.map((post) => (
              <GlassCard
                key={post.id}
                hoverGlow={true}
                className="p-5 border-white/5 hover:border-white/10 group"
              >
                <div className="space-y-4">
                  {/* User Profile */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userAvatar}
                        alt={post.user}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-white group-hover:text-brand-purple transition duration-200">{post.user}</h4>
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-brand-purple/20 text-brand-purple border border-brand-purple/20 font-bold uppercase">
                            {post.userTitle}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{post.timeAgo}</span>
                      </div>
                    </div>
                    {post.movieTag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-blue/15 border border-brand-blue/20 text-brand-blue font-semibold">
                        {post.movieTag}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                    {post.content}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center space-x-6 border-t border-white/5 pt-3 mt-1.5">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer transition ${
                        likes[post.id] ? "text-red-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likes[post.id] ? "fill-red-400 text-red-400" : ""}`} />
                      <span>{likedCounts[post.id]}</span>
                    </button>
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} Comments</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Right Column: Sidebar (6 cols divided into Movie Clubs & Poll/Followers) */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:gap-8 gap-8">
            
            {/* Movie Clubs */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-lg text-white">Movie Clubs</h3>
                <span className="text-xs text-brand-blue font-bold cursor-pointer hover:underline">View All</span>
              </div>

              <div className="space-y-4">
                {MOCK_CLUBS.map((club) => (
                  <GlassCard
                    key={club.id}
                    hoverGlow={true}
                    className="p-4 border-white/5 hover:border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={club.coverUrl}
                        alt={club.name}
                        className="w-14 h-14 object-cover rounded-xl border border-white/10"
                      />
                      <div className="space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{club.name}</h4>
                          <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-semibold">
                            <Users className="w-3 h-3 text-brand-blue" />
                            <span>{club.members}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal line-clamp-1">
                          {club.description}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-slate-500 uppercase font-medium">Currently watching</span>
                          <span className="text-[9px] text-brand-purple font-bold truncate max-w-[120px]">{club.currentMovie}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Poll & Follow suggestions */}
            <div className="space-y-8">
              
              {/* Poll Widget */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Vote className="w-4 h-4 text-brand-purple" />
                  <h3 className="font-display font-bold text-base text-slate-200">Community Poll</h3>
                </div>

                <GlassCard hoverGlow={false} className="p-5 border-white/10">
                  <h4 className="text-xs font-bold text-white mb-4 leading-normal">
                    {INITIAL_POLL.question}
                  </h4>
                  <div className="space-y-3">
                    {pollOptions.map((opt) => {
                      const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleVote(opt.id)}
                          className={`relative py-3 px-4 rounded-xl border cursor-pointer overflow-hidden transition-all ${
                            votedOption === opt.id
                              ? "bg-brand-purple/20 border-brand-purple"
                              : votedOption
                              ? "bg-white/3 border-white/5 opacity-60 cursor-default"
                              : "bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5"
                          }`}
                        >
                          {/* Animated vote fill progress */}
                          {votedOption && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="absolute left-0 top-0 bottom-0 bg-brand-purple/10 pointer-events-none"
                            />
                          )}
                          
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-200">{opt.text}</span>
                            {votedOption ? (
                              <span className="text-xs font-bold text-brand-purple">{percentage}%</span>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Vote</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {votedOption && (
                    <p className="text-[10px] text-slate-500 text-center mt-3 font-semibold tracking-wide">
                      Total Votes Cast: {totalVotes.toLocaleString()}
                    </p>
                  )}
                </GlassCard>
              </div>

              {/* Followers Widget */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-widest">Active Reviewers to Follow</h3>
                <GlassCard hoverGlow={false} className="p-4 border-white/5 space-y-4">
                  {SUGGESTED_USERS.map((user) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={user.avatar} alt={user.name} className="w-8.5 h-8.5 rounded-full object-cover border border-white/10" />
                        <div>
                          <h4 className="text-xs font-bold text-white">{user.name}</h4>
                          <span className="text-[9px] text-slate-500">{user.handle}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFollow(user.name)}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition duration-200 cursor-pointer ${
                          followedUsers[user.name]
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {followedUsers[user.name] ? (
                          <span className="flex items-center space-x-1"><Check className="w-3 h-3" /> <span>Following</span></span>
                        ) : (
                          <span className="flex items-center space-x-1"><Plus className="w-3 h-3 text-brand-blue" /> <span>Follow</span></span>
                        )}
                      </button>
                    </div>
                  ))}
                </GlassCard>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
