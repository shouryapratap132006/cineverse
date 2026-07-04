"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Star,
  BookOpen,
  PenLine,
  CalendarDays,
  List,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Heart,
  Eye,
  EyeOff,
  RefreshCcw,
  Plus,
  Film,
  BarChart3,
  Loader2,
  MessageSquare,
  Lock,
  Unlock,
  SortAsc,
  AlertTriangle,
} from "lucide-react";
import { getUserReviews, deleteReview, likeReview, searchMoviesForReview, createReview } from "@/actions/review";
import { getUserDiary, addDiaryEntry, deleteDiaryEntry, getDiaryStats } from "@/actions/diary";
import { getUserLists, createList, deleteList, addMovieToList } from "@/actions/lists";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewItem {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string | null;
  rating: number;
  content: string;
  containsSpoilers: boolean;
  isRewatch: boolean;
  visibility: string;
  watchedAt: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

interface DiaryItem {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string | null;
  watchedAt: string;
  rating: number | null;
  notes: string | null;
  isRewatch: boolean;
  hasReview: boolean;
  reviewId: string | null;
}

interface ListItem {
  id: string;
  name: string;
  description: string | null;
  isRanked: boolean;
  isPublic: boolean;
  movieCount: number;
  updatedAt: string;
  coverPosters: (string | null)[];
}

interface MovieSearchResult {
  id: string;
  title: string;
  posterPath: string | null;
  releaseYear: number | null;
  overview: string;
}

type Tab = "reviews" | "write" | "diary" | "lists";
type SortOrder = "newest" | "oldest" | "highest" | "lowest";

// ─── Star Rating Component ────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  max = 10,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const [hover, setHover] = useState(0);
  const stars = max / 2; // Display as 5 stars, each = 2 points
  const sz = size === "sm" ? "w-5 h-5" : "w-7 h-7";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: stars }, (_, i) => {
        const full = (i + 1) * 2;
        const half = (i + 1) * 2 - 1;
        const active = hover || value;
        return (
          <div key={i} className="relative cursor-pointer">
            {/* Half star left */}
            <div
              className="absolute left-0 top-0 w-1/2 h-full z-10"
              onMouseEnter={() => setHover(half)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(half)}
            />
            {/* Full star right */}
            <div
              className="absolute right-0 top-0 w-1/2 h-full z-10"
              onMouseEnter={() => setHover(full)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(full)}
            />
            <Star
              className={`${sz} transition-colors ${
                active >= full
                  ? "fill-amber-400 text-amber-400"
                  : active >= half
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-white/20"
              }`}
            />
          </div>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-amber-400 font-bold text-sm">
          {(value / 2).toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── Movie Search Modal ───────────────────────────────────────────────────────

function MovieSearchModal({
  onSelect,
  onClose,
  title,
}: {
  onSelect: (m: MovieSearchResult) => void;
  onClose: () => void;
  title: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchMoviesForReview(q);
      setResults(res.results as MovieSearchResult[]);
      setLoading(false);
    }, 350);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1221] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-bold text-base">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a film..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition"
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 animate-spin" />
            )}
          </div>
          <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => { onSelect(m); onClose(); }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition text-left group"
              >
                {m.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${m.posterPath}`}
                    alt={m.title}
                    className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-slate-500" />
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-violet-300 transition">
                    {m.title}
                  </p>
                  {m.releaseYear && (
                    <p className="text-slate-500 text-xs">{m.releaseYear}</p>
                  )}
                </div>
              </button>
            ))}
            {!loading && query.length > 1 && results.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-8">No films found for "{query}"</p>
            )}
            {!query && (
              <p className="text-center text-slate-600 text-xs py-8">Start typing to search…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Write Review Tab ─────────────────────────────────────────────────────────

function WriteReviewTab({ onSuccess }: { onSuccess: () => void }) {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieSearchResult | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [isRewatch, setIsRewatch] = useState(false);
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10));
  const [addToDiary, setAddToDiary] = useState(true);
  const [visibility, setVisibility] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedMovie) return setError("Please select a film.");
    if (rating === 0) return setError("Please add a rating.");
    if (!content.trim()) return setError("Please write a review.");

    setSaving(true);
    setError("");
    const res = await createReview(
      selectedMovie.id,
      selectedMovie.title,
      selectedMovie.posterPath ?? "",
      rating,
      content,
      { containsSpoilers: spoiler, isRewatch, watchedAt, addToDiary, visibility }
    );
    setSaving(false);

    if (res.success) {
      setSelectedMovie(null);
      setRating(0);
      setContent("");
      setSpoiler(false);
      setIsRewatch(false);
      setAddToDiary(true);
      onSuccess();
    } else {
      setError(res.error || "Failed to save review.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {showSearch && (
        <MovieSearchModal
          title="Select a Film to Review"
          onSelect={(m) => setSelectedMovie(m)}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Film Selector */}
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
          Film
        </label>
        <button
          onClick={() => setShowSearch(true)}
          className="w-full flex items-center gap-4 p-4 bg-white/3 border border-white/10 rounded-2xl hover:border-violet-500/50 hover:bg-white/5 transition group"
        >
          {selectedMovie ? (
            <>
              {selectedMovie.posterPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${selectedMovie.posterPath}`}
                  alt={selectedMovie.title}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                  <Film className="w-5 h-5 text-slate-500" />
                </div>
              )}
              <div className="text-left">
                <p className="text-white font-bold">{selectedMovie.title}</p>
                {selectedMovie.releaseYear && (
                  <p className="text-slate-400 text-sm">{selectedMovie.releaseYear}</p>
                )}
              </div>
              <span className="ml-auto text-xs text-violet-400 group-hover:text-violet-300">Change</span>
            </>
          ) : (
            <>
              <div className="w-12 h-16 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-slate-400 text-sm">Search for a film…</span>
              <Plus className="w-4 h-4 text-slate-500 ml-auto" />
            </>
          )}
        </button>
      </div>

      {/* Rating */}
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
          Rating
        </label>
        <div className="bg-white/3 border border-white/10 rounded-2xl p-4">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
          Your Review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="Share your thoughts on this film…"
          className="w-full bg-white/3 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition resize-none leading-relaxed"
        />
        <p className="text-right text-xs text-slate-600 mt-1">{content.length} chars</p>
      </div>

      {/* Options Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
            Date Watched
          </label>
          <input
            type="date"
            value={watchedAt}
            onChange={(e) => setWatchedAt(e.target.value)}
            className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2 block">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition"
          >
            <option value="PUBLIC">🌐 Public</option>
            <option value="FRIENDS">👥 Friends Only</option>
            <option value="PRIVATE">🔒 Private</option>
          </select>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Contains Spoilers", value: spoiler, set: setSpoiler, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
          { label: "Rewatch", value: isRewatch, set: setIsRewatch, icon: <RefreshCcw className="w-3.5 h-3.5" /> },
          { label: "Add to Diary", value: addToDiary, set: setAddToDiary, icon: <CalendarDays className="w-3.5 h-3.5" /> },
        ].map(({ label, value, set, icon }) => (
          <button
            key={label}
            onClick={() => set(!value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              value
                ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                : "bg-white/3 border-white/10 text-slate-400 hover:border-white/20"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PenLine className="w-4 h-4" />}
        {saving ? "Saving…" : "Save Review"}
      </button>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({ refresh }: { refresh: number }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserReviews();
    if (res.success) setReviews(res.reviews as ReviewItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refresh]);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "highest") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeletingId(null);
  };

  const handleLike = async (id: string) => {
    await likeReview(id);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, likeCount: r.likeCount + 1 } : r
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <PenLine className="w-12 h-12 text-slate-600 mx-auto" />
        <p className="text-slate-400 font-medium">No reviews yet</p>
        <p className="text-slate-600 text-sm">Head to the "Write" tab to log your first film.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sort */}
      <div className="flex items-center gap-2">
        <SortAsc className="w-4 h-4 text-slate-500" />
        {(["newest", "oldest", "highest", "lowest"] as SortOrder[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition capitalize ${
              sort === s
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {sorted.map((r) => (
        <div
          key={r.id}
          className="group border border-white/5 bg-white/2 hover:border-white/10 rounded-2xl overflow-hidden transition"
        >
          <div className="flex gap-4 p-4">
            {/* Poster */}
            <Link href={`/dashboard/movies/${r.movieId}`} className="flex-shrink-0">
              {r.moviePoster ? (
                <img
                  src={r.moviePoster}
                  alt={r.movieTitle}
                  className="w-16 h-24 object-cover rounded-xl hover:scale-105 transition"
                />
              ) : (
                <div className="w-16 h-24 bg-white/5 rounded-xl flex items-center justify-center">
                  <Film className="w-6 h-6 text-slate-600" />
                </div>
              )}
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/dashboard/movies/${r.movieId}`}
                    className="text-white font-bold text-sm hover:text-violet-300 transition"
                  >
                    {r.movieTitle}
                  </Link>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {r.watchedAt
                      ? new Date(r.watchedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                      : new Date(r.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold">{(r.rating / 2).toFixed(1)}</span>
                  </div>
                  {r.isRewatch && (
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-semibold uppercase">
                      Rewatch
                    </span>
                  )}
                  {r.containsSpoilers && (
                    <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-md font-semibold uppercase">
                      Spoilers
                    </span>
                  )}
                  {r.visibility === "PRIVATE" && <Lock className="w-3 h-3 text-slate-500" />}
                </div>
              </div>

              <p className={`text-slate-300 text-xs leading-relaxed ${expandedId === r.id ? "" : "line-clamp-3"}`}>
                {r.containsSpoilers && expandedId !== r.id ? (
                  <span className="text-slate-500 italic">⚠️ This review contains spoilers. Click to reveal.</span>
                ) : r.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition"
                >
                  {expandedId === r.id ? "Show less" : "Read more"}
                </button>
                <button
                  onClick={() => handleLike(r.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-pink-400 transition"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{r.likeCount}</span>
                </button>
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{r.commentCount}</span>
                </span>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="ml-auto text-slate-600 hover:text-red-400 transition disabled:opacity-50"
                >
                  {deletingId === r.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Diary Tab ────────────────────────────────────────────────────────────────

function DiaryTab({ refresh }: { refresh: number }) {
  const [entries, setEntries] = useState<DiaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [stats, setStats] = useState({ totalWatched: 0, totalRewatches: 0, avgRating: 0, thisYear: 0 });

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const load = useCallback(async () => {
    setLoading(true);
    const [diaryRes, statsRes] = await Promise.all([
      getUserDiary({ month, year }),
      getDiaryStats(),
    ]);
    if (diaryRes.success) setEntries(diaryRes.entries as DiaryItem[]);
    setStats(statsRes);
    setLoading(false);
  }, [month, year, refresh]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleDelete = async (id: string) => {
    await deleteDiaryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Films", value: stats.totalWatched, icon: <Film className="w-4 h-4" /> },
          { label: "This Year", value: stats.thisYear, icon: <CalendarDays className="w-4 h-4" /> },
          { label: "Avg Rating", value: stats.avgRating || "—", icon: <Star className="w-4 h-4" /> },
          { label: "Rewatches", value: stats.totalRewatches, icon: <RefreshCcw className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white/3 border border-white/5 rounded-2xl p-3 text-center">
            <div className="flex justify-center text-violet-400 mb-1">{s.icon}</div>
            <p className="text-white font-bold text-lg">{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-white font-bold text-base">{monthName}</h2>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {showAdd && (
        <AddDiaryEntryForm
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); load(); }}
        />
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAdd(true)}
        className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:text-violet-300 hover:border-violet-500/40 transition flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Log a film
      </button>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">Nothing logged in {monthName}.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center gap-4 p-3 bg-white/2 border border-white/5 hover:border-white/10 rounded-2xl transition group">
              {/* Day */}
              <div className="text-center flex-shrink-0 w-10">
                <p className="text-white font-bold text-lg leading-none">
                  {new Date(e.watchedAt).getDate()}
                </p>
                <p className="text-slate-500 text-xs uppercase">
                  {new Date(e.watchedAt).toLocaleDateString("en-US", { weekday: "short" })}
                </p>
              </div>

              {/* Poster */}
              <Link href={`/dashboard/movies/${e.movieId}`}>
                {e.moviePoster ? (
                  <img src={e.moviePoster} alt={e.movieTitle} className="w-10 h-14 object-cover rounded-lg flex-shrink-0 hover:scale-105 transition" />
                ) : (
                  <div className="w-10 h-14 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Film className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/movies/${e.movieId}`} className="text-white text-sm font-semibold hover:text-violet-300 transition truncate block">
                  {e.movieTitle}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  {e.rating && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span className="text-xs font-bold">{(e.rating / 2).toFixed(1)}</span>
                    </div>
                  )}
                  {e.isRewatch && (
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-500/30 font-semibold uppercase">
                      Rewatch
                    </span>
                  )}
                  {e.hasReview && (
                    <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-md border border-violet-500/30 font-semibold uppercase">
                      Reviewed
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(e.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Diary Entry Form ─────────────────────────────────────────────────────

function AddDiaryEntryForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [movie, setMovie] = useState<MovieSearchResult | null>(null);
  const [watchedAt, setWatchedAt] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [isRewatch, setIsRewatch] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!movie) return;
    setSaving(true);
    await addDiaryEntry({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.posterPath ?? "",
      watchedAt,
      rating: rating || undefined,
      notes: notes || undefined,
      isRewatch,
    });
    setSaving(false);
    onSuccess();
  };

  return (
    <div className="bg-white/3 border border-violet-500/30 rounded-2xl p-5 space-y-4">
      {showSearch && (
        <MovieSearchModal
          title="Log a Film"
          onSelect={(m) => setMovie(m)}
          onClose={() => setShowSearch(false)}
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">Log a Film</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => setShowSearch(true)}
        className="w-full flex items-center gap-3 p-3 bg-white/3 border border-white/10 rounded-xl hover:border-violet-500/40 transition"
      >
        {movie ? (
          <>
            {movie.posterPath && (
              <img src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`} alt={movie.title} className="w-8 h-11 object-cover rounded-md" />
            )}
            <span className="text-white text-sm font-medium">{movie.title}</span>
            <span className="ml-auto text-xs text-violet-400">Change</span>
          </>
        ) : (
          <>
            <Search className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-sm">Search film…</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Date Watched</label>
          <input
            type="date"
            value={watchedAt}
            onChange={(e) => setWatchedAt(e.target.value)}
            className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Rating (optional)</label>
          <div className="bg-white/3 border border-white/10 rounded-xl px-3 py-1.5">
            <StarRating value={rating} onChange={setRating} size="sm" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 mb-1 block">Quick Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Quick thoughts…"
          className="w-full bg-white/3 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsRewatch(!isRewatch)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
            isRewatch ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-white/3 border-white/10 text-slate-400"
          }`}
        >
          <RefreshCcw className="w-3 h-3" />
          Rewatch
        </button>

        <button
          onClick={handleSave}
          disabled={!movie || saving}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Log Film
        </button>
      </div>
    </div>
  );
}

// ─── Lists Tab ────────────────────────────────────────────────────────────────

function ListsTab({ refresh }: { refresh: number }) {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newRanked, setNewRanked] = useState(false);
  const [newPublic, setNewPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedList, setSelectedList] = useState<ListItem | null>(null);
  const [showAddMovie, setShowAddMovie] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getUserLists();
    if (res.success) setLists(res.lists as ListItem[]);
    setLoading(false);
  }, [refresh]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await createList(newName, newDesc, newRanked, newPublic);
    setNewName(""); setNewDesc(""); setNewRanked(false); setNewPublic(true);
    setShowCreate(false);
    setCreating(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const handleAddMovie = async (movie: MovieSearchResult) => {
    if (!selectedList) return;
    await addMovieToList(selectedList.id, movie.id, movie.title, movie.posterPath ?? "");
    load();
    setShowAddMovie(false);
  };

  return (
    <div className="space-y-5">
      {showAddMovie && selectedList && (
        <MovieSearchModal
          title={`Add to "${selectedList.name}"`}
          onSelect={handleAddMovie}
          onClose={() => setShowAddMovie(false)}
        />
      )}

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-slate-400 hover:text-violet-300 hover:border-violet-500/40 transition flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        New List
      </button>

      {showCreate && (
        <div className="bg-white/3 border border-violet-500/30 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold text-sm">Create a New List</h3>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="List name…"
            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition"
          />
          <textarea
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)…"
            rows={2}
            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition resize-none"
          />
          <div className="flex items-center gap-3">
            {[
              { label: "Ranked", value: newRanked, set: setNewRanked },
              { label: "Public", value: newPublic, set: setNewPublic },
            ].map(({ label, value, set }) => (
              <button
                key={label}
                onClick={() => set(!value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  value ? "bg-violet-500/20 border-violet-500/40 text-violet-300" : "bg-white/3 border-white/10 text-slate-400"
                }`}
              >
                {label === "Ranked" ? <BarChart3 className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-1.5 text-xs text-slate-400 hover:text-white transition">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
              >
                {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-violet-400 animate-spin" /></div>
      ) : lists.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <List className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-medium">No lists yet</p>
          <p className="text-slate-600 text-sm">Create your first list — "Top 10 Horror", "2024 Films", etc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lists.map((l) => (
            <div key={l.id} className="group bg-white/2 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition">
              {/* Cover poster collage */}
              <div className="grid grid-cols-4 h-24 overflow-hidden">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="bg-white/5">
                    {l.coverPosters[i] ? (
                      <img src={l.coverPosters[i]!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-900/30 to-indigo-900/30 flex items-center justify-center">
                        <Film className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-sm truncate">{l.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{l.movieCount} film{l.movieCount !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {l.isRanked && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-500/30 font-semibold uppercase">
                        Ranked
                      </span>
                    )}
                    {!l.isPublic && <Lock className="w-3 h-3 text-slate-500 mt-0.5" />}
                  </div>
                </div>

                {l.description && (
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">{l.description}</p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => { setSelectedList(l); setShowAddMovie(true); }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add film
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "reviews", label: "My Reviews", icon: <BookOpen className="w-4 h-4" /> },
  { id: "write", label: "Write", icon: <PenLine className="w-4 h-4" /> },
  { id: "diary", label: "Diary", icon: <CalendarDays className="w-4 h-4" /> },
  { id: "lists", label: "Lists", icon: <List className="w-4 h-4" /> },
];

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reviews");
  const [refresh, setRefresh] = useState(0);

  const onSuccess = () => {
    setRefresh((r) => r + 1);
    setActiveTab("reviews");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
          Reviews & Diary
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Your personal cinema journal — log, rate, and remember every film you watch.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/3 border border-white/5 p-1 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`reviews-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "reviews" && <ReviewsTab refresh={refresh} />}
        {activeTab === "write" && <WriteReviewTab onSuccess={onSuccess} />}
        {activeTab === "diary" && <DiaryTab refresh={refresh} />}
        {activeTab === "lists" && <ListsTab refresh={refresh} />}
      </div>
    </div>
  );
}
