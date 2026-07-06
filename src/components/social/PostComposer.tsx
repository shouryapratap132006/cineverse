"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Film, BarChart2, EyeOff, Send, X } from "lucide-react";
import { createPost } from "@/actions/social";
import { useCineverseAuth } from "@/components/provider";
import { cn } from "@/lib/utils";
import { createCommunityPost } from "@/actions/community";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

export default function PostComposer({
  onPostCreated,
  communityId,
}: {
  onPostCreated?: () => void;
  communityId?: string;
}) {
  const { user } = useCineverseAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedMovie, setAttachedMovie] = useState<any | null>(null);
  const [showMoviePicker, setShowMoviePicker] = useState(false);
  const [movieQuery, setMovieQuery] = useState("");
  const [movieResults, setMovieResults] = useState<any[]>([]);
  const [movieSearching, setMovieSearching] = useState(false);
  const [pollMode, setPollMode] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [audience, setAudience] = useState<"feed" | "community">("feed");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!movieQuery.trim()) {
      setMovieResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setMovieSearching(true);
      try {
        const response = await fetch(`${BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(movieQuery)}&page=1`);
        const data = await response.json();
        setMovieResults((data.results || []).slice(0, 6));
      } catch {
        setMovieResults([]);
      } finally {
        setMovieSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [movieQuery]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setAttachedImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions((prev) => prev.map((option, optionIndex) => (optionIndex === index ? value : option)));
  };

  const addPollOption = () => {
    if (pollOptions.length >= 4) return;
    setPollOptions((prev) => [...prev, ""]);
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !attachedImage && !attachedMovie && !pollMode) || isSubmitting) return;
    setIsSubmitting(true);

    const poll = pollMode && pollQuestion.trim() && pollOptions.filter(Boolean).length >= 2
      ? { question: pollQuestion.trim(), options: pollOptions.filter(Boolean) }
      : undefined;

    const payload = {
      content: content.trim(),
      spoilerTag: spoiler,
      imageUrl: attachedImage || undefined,
      movieId: attachedMovie?.id?.toString() || undefined,
      poll,
    };

    const res = audience === "community" && communityId
      ? await createCommunityPost(communityId, content.trim(), attachedImage || undefined)
      : await createPost(payload);

    if (res.success) {
      setContent("");
      setSpoiler(false);
      setAttachedImage(null);
      setAttachedMovie(null);
      setPollMode(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setAudience("feed");
      if (onPostCreated) onPostCreated();
    } else {
      alert("Failed to post: " + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 mb-6 shadow-lg backdrop-blur-md">
      <div className="flex items-start space-x-4">
        <img 
          src={user?.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg"} 
          alt="Avatar" 
          className="w-11 h-11 rounded-full object-cover border border-white/10"
        />
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your cinematic thought today?"
            className="w-full bg-transparent text-white placeholder-slate-500 resize-none outline-none text-base"
            rows={3}
          />

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="relative w-full max-h-60 rounded-xl overflow-hidden border border-white/10 bg-slate-950">
              <img src={attachedImage} alt="Attachment" className="w-full max-h-60 object-contain mx-auto" />
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-950 border border-white/15 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {attachedMovie && (
            <div className="flex items-center justify-between rounded-xl border border-brand-purple/20 bg-brand-purple/10 px-3 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-purple">Tagged Movie</p>
                <p className="text-sm font-semibold text-white">{attachedMovie.title}</p>
              </div>
              <button type="button" onClick={() => setAttachedMovie(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {pollMode && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What should the poll ask?"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              />
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
                />
              ))}
              <div className="flex items-center justify-between">
                <button type="button" onClick={addPollOption} className="text-xs font-semibold text-brand-blue">
                  Add option
                </button>
                <button type="button" onClick={() => setPollMode(false)} className="text-xs font-semibold text-slate-400">
                  Remove poll
                </button>
              </div>
            </div>
          )}

          {showMoviePicker && (
            <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
              <input
                value={movieQuery}
                onChange={(e) => setMovieQuery(e.target.value)}
                placeholder="Search a movie to tag"
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none"
              />
              {movieSearching && <p className="mt-2 text-xs text-slate-500">Searching…</p>}
              <div className="mt-2 space-y-2">
                {movieResults.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => {
                      setAttachedMovie(movie);
                      setShowMoviePicker(false);
                      setMovieQuery("");
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                  >
                    <span>{movie.title}</span>
                    <span className="text-[10px] text-slate-500">{movie.release_date?.split("-")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-white/5" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-brand-blue hover:bg-brand-blue/10 rounded-full transition"
                title="Attach Image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowMoviePicker((prev) => !prev)}
                className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-full transition"
                title="Tag Movie"
              >
                <Film className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setPollMode((prev) => !prev)}
                className="p-2 text-brand-gold hover:bg-brand-gold/10 rounded-full transition"
                title="Create Poll"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setSpoiler(!spoiler)}
                className={cn("p-2 rounded-full transition flex items-center space-x-1", spoiler ? "text-red-400 bg-red-400/10" : "text-slate-400 hover:bg-slate-800")}
                title="Spoiler Warning"
              >
                <EyeOff className="w-5 h-5" />
                {spoiler && <span className="text-[10px] font-bold uppercase">Spoiler</span>}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {communityId && (
                <select value={audience} onChange={(e) => setAudience(e.target.value as "feed" | "community")} className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300 outline-none">
                  <option value="feed">Feed</option>
                  <option value="community">Community</option>
                </select>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!content.trim() && !attachedImage && !attachedMovie && !pollMode) || isSubmitting}
                className="bg-brand-purple hover:bg-purple-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-full text-sm flex items-center space-x-2 transition"
              >
                {isSubmitting ? (
                  <span>Posting...</span>
                ) : (
                  <>
                    <span>Post</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
