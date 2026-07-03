"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Star, Plus, Check, Heart, Play, Users, Bookmark } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";

const DEMO_MOVIES = [
  { id: "d1", title: "Interstellar", rating: 8.7, genre: "Sci-Fi", poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150" },
  { id: "d2", title: "Parasite", rating: 8.6, genre: "Thriller", poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150" },
  { id: "d3", title: "Spirited Away", rating: 8.6, genre: "Anime", poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150" }
];

const MOCK_AI_RESPONSES = {
  sad: "I recommend 'Whiplash' (2014) or 'Interstellar'. If you want emotional catharsis, Interstellar explores father-daughter love across space-time. If you want intense drive, Whiplash will shock you into focus.",
  happy: "I recommend 'La La Land' (2016) or 'Spirited Away'. Both are magical, visually vibrant masterpieces that will leave you smiling and humming their themes for days.",
  dark: "I recommend 'Parasite' (2019) or 'Get Out' (2017). Both are psychological thrillers that offer exceptional social commentary mixed with high tension."
};

export default function InteractiveDemo() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState(DEMO_MOVIES);
  const [watchlistCount, setWatchlistCount] = useState(3);
  const [watchlistAdded, setWatchlistAdded] = useState<Record<string, boolean>>({});
  const [selectedMovie, setSelectedMovie] = useState(DEMO_MOVIES[0]);
  
  // AI Bot states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("Ask me anything: 'I want a movie like Interstellar but emotional' or 'Give me something happy'");
  const [aiTyping, setAiTyping] = useState(false);

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredMovies(DEMO_MOVIES);
    } else {
      setFilteredMovies(
        DEMO_MOVIES.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genre.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery]);

  // Simulate AI search response typing
  const handleAiQuery = (promptType: "sad" | "happy" | "dark") => {
    setAiTyping(true);
    setAiResponse("");
    let text = "";
    
    if (promptType === "sad") {
      text = MOCK_AI_RESPONSES.sad;
      setAiPrompt("I want a movie like Interstellar but emotional...");
    } else if (promptType === "happy") {
      text = MOCK_AI_RESPONSES.happy;
      setAiPrompt("Give me a magical, feel-good film...");
    } else {
      text = MOCK_AI_RESPONSES.dark;
      setAiPrompt("Show me a smart thriller with social themes...");
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setAiResponse((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
        setAiTyping(false);
      }
    }, 15);
  };

  const toggleWatchlist = (id: string) => {
    setWatchlistAdded((prev) => {
      const isAdded = !prev[id];
      setWatchlistCount((count) => isAdded ? count + 1 : count - 1);
      return { ...prev, [id]: isAdded };
    });
  };

  return (
    <section id="demo" className="py-24 relative z-10 bg-slate-950/20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white">
            Experience the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
              Dashboard.
            </span>
          </h2>
          <p className="text-slate-400 font-light max-w-xl mx-auto leading-relaxed">
            Click, search, and chat with our mock sandbox. See how fluid it feels before creating your account.
          </p>
        </div>

        {/* Mock Application Container */}
        <div className="w-full rounded-2xl glass-panel border border-white/10 shadow-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[900px] lg:h-[680px]">
          
          {/* Left Column: Sandbox Sidebar */}
          <div className="lg:col-span-3 border-r border-white/5 p-6 flex flex-col justify-between bg-slate-950/40">
            <div className="space-y-6">
              {/* User badge */}
              <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">Cinephile_Demo</h4>
                  <span className="text-[10px] text-brand-purple font-semibold uppercase tracking-wider">Level 1 Critic</span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1.5">
                <div className="px-3.5 py-2.5 rounded-lg text-sm bg-white/5 text-white font-medium flex items-center space-x-3 cursor-pointer">
                  <Play className="w-4 h-4 text-brand-blue" />
                  <span>Sandbox Feed</span>
                </div>
                <div className="px-3.5 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center justify-between cursor-pointer transition">
                  <div className="flex items-center space-x-3">
                    <Bookmark className="w-4 h-4" />
                    <span>Watchlist</span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-brand-blue/20 text-brand-blue font-bold">{watchlistCount}</span>
                </div>
                <div className="px-3.5 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 flex items-center space-x-3 cursor-pointer transition">
                  <Users className="w-4 h-4" />
                  <span>Movie Clubs</span>
                </div>
              </div>
            </div>

            {/* App controls prompt */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-brand-blue/10 to-brand-purple/10 border border-brand-purple/20 text-slate-400 text-xs leading-relaxed space-y-2">
              <span className="font-semibold text-white block">★ Quick Sandbox Task</span>
              <span>Type below to search, add titles to your watchlist, or test AI recommendations.</span>
            </div>
          </div>

          {/* Middle Column: Interactive Movies & Chat */}
          <div className="lg:col-span-6 p-6 flex flex-col justify-between space-y-6">
            
            {/* Search Section */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sandbox movies... (e.g. Interstellar, Parasite)"
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>

              {/* Grid of Results */}
              <div className="grid grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredMovies.map((movie) => (
                    <motion.div
                      key={movie.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedMovie(movie)}
                      className={`p-3 rounded-xl border cursor-pointer transition relative overflow-hidden group ${
                        selectedMovie.id === movie.id 
                          ? "bg-slate-900 border-brand-purple" 
                          : "bg-white/3 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-28 object-cover rounded-lg mb-2.5 transition duration-300 group-hover:scale-105"
                      />
                      <h4 className="text-xs font-bold text-white truncate text-center">{movie.title}</h4>
                      <span className="text-[10px] text-slate-500 block text-center mt-0.5">{movie.genre}</span>
                    </motion.div>
                  ))}
                  {filteredMovies.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-sm text-slate-500">
                      No sandbox movies match your query.
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Simulated Chat Interface */}
            <div className="flex-grow flex flex-col justify-end space-y-4 pt-6 border-t border-white/5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI CineCompanion Chat</span>
                  </div>
                  {aiTyping && (
                    <span className="text-[10px] text-brand-purple font-semibold animate-pulse">Typing...</span>
                  )}
                </div>

                {/* Prompt display */}
                {aiPrompt && (
                  <div className="flex justify-end">
                    <div className="bg-brand-blue/20 border border-brand-blue/30 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-xs max-w-[85%] font-light leading-relaxed">
                      {aiPrompt}
                    </div>
                  </div>
                )}

                {/* Response bubble */}
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/8 text-slate-300 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs max-w-[90%] font-light leading-relaxed min-h-[50px]">
                    {aiResponse}
                  </div>
                </div>
              </div>

              {/* Bot preset options */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] font-bold text-slate-500 flex items-center pr-1">Try Prompts:</span>
                <button
                  disabled={aiTyping}
                  onClick={() => handleAiQuery("sad")}
                  className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-brand-purple/30 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer transition active:scale-95"
                >
                  "Emotional like Interstellar"
                </button>
                <button
                  disabled={aiTyping}
                  onClick={() => handleAiQuery("happy")}
                  className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-brand-purple/30 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer transition active:scale-95"
                >
                  "Something magical/happy"
                </button>
                <button
                  disabled={aiTyping}
                  onClick={() => handleAiQuery("dark")}
                  className="px-3 py-1.5 bg-white/5 border border-white/5 hover:border-brand-purple/30 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-semibold cursor-pointer transition active:scale-95"
                >
                  "Smart social thriller"
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Mini Inspector Details */}
          <div className="lg:col-span-3 border-l border-white/5 p-6 flex flex-col justify-between bg-slate-950/40">
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detail Inspector</h4>
              
              <div className="space-y-4">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full h-44 object-cover rounded-xl border border-white/10 shadow-lg"
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{selectedMovie.title}</h3>
                    <div className="flex items-center text-brand-gold text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-brand-gold mr-0.5" />
                      <span>{selectedMovie.rating}</span>
                    </div>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                    {selectedMovie.genre}
                  </span>
                </div>
              </div>
            </div>

            {/* Watchlist toggle btn */}
            <div className="pt-6">
              <button
                onClick={() => toggleWatchlist(selectedMovie.id)}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-semibold text-xs transition active:scale-95 ${
                  watchlistAdded[selectedMovie.id]
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                }`}
              >
                {watchlistAdded[selectedMovie.id] ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>In Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-brand-blue" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
