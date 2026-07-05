"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Film, Users, Globe, MessageSquare, Camera, Clapperboard,
  Tv, Star, ChevronRight, Loader2, UserCheck, Megaphone
} from "lucide-react";
import { globalSearch } from "@/actions/search";
import GlassCard from "@/components/shared/GlassCard";

const CATEGORIES = [
  { id: "all", label: "All", icon: Search },
  { id: "movies", label: "Movies", icon: Film },
  { id: "tv", label: "TV Shows", icon: Tv },
  { id: "cast", label: "Cast", icon: Camera },
  { id: "crew", label: "Crew", icon: Clapperboard },
  { id: "people", label: "Critics", icon: Users },
  { id: "communities", label: "Communities", icon: Globe },
  { id: "posts", label: "Discussions", icon: MessageSquare },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string, cat: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    const res = await globalSearch(q, cat);
    if (res.success) {
      setResults(res.results);
      setSearched(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query, category), 500);
    return () => clearTimeout(timer);
  }, [query, category, doSearch]);

  const imgUrl = (path: string | null | undefined, size = "w300") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 min-h-screen">

      {/* Header */}
      <div className="space-y-1 mb-8">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-purple shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </span>
          Global Search
        </h1>
        <p className="text-sm text-slate-400 pl-1">Discover movies, cast, crew, critics, communities and discussions.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, actors, directors, critics..."
          className="w-full pl-14 pr-14 py-5 bg-slate-900/80 border border-white/10 rounded-2xl text-white placeholder-slate-500 outline-none focus:border-brand-purple/60 focus:bg-slate-900 transition-all shadow-xl text-base font-medium"
          autoFocus
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
            <Loader2 className="w-5 h-5 text-brand-purple animate-spin" />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                active
                  ? "bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border-brand-purple/50 text-white shadow"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-brand-purple" : ""}`} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {!query && !searched && (
        <div className="flex flex-col items-center justify-center py-24 opacity-40">
          <Search className="w-20 h-20 text-slate-600 mb-4" />
          <p className="text-slate-400 font-medium text-lg">Type to search the CineVerse universe</p>
          <p className="text-slate-500 text-sm mt-1">Movies · Actors · Directors · Critics · Communities</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-12">

          {/* MOVIES */}
          {(category === "all" || category === "movies") && results.movies?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Film className="w-4 h-4 text-brand-blue" />} title="Movies" count={results.movies.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4">
                {results.movies.map((m: any) => (
                  <Link key={m.id} href={`/dashboard/movies/${m.id}`} className="group block">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group-hover:border-brand-blue/60 transition-all duration-300 shadow-lg relative">
                      {imgUrl(m.posterPath) ? (
                        <img
                          src={imgUrl(m.posterPath)!}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <Film className="w-8 h-8 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-xs font-bold text-white leading-tight">{m.title}</span>
                      </div>
                      {m.rating > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md border border-white/10">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[9px] font-bold text-amber-400">{m.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-300 group-hover:text-white truncate mt-2 transition">
                      {m.title}
                    </h4>
                    {m.releaseDate && (
                      <span className="text-[10px] text-slate-500">{m.releaseDate.split("-")[0]}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* TV SHOWS */}
          {(category === "all" || category === "tv") && results.tv?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Tv className="w-4 h-4 text-green-400" />} title="TV Shows" count={results.tv.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-4">
                {results.tv.map((t: any) => (
                  <div key={t.id} className="group block cursor-default">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 group-hover:border-green-500/50 transition-all duration-300 shadow-lg">
                      {imgUrl(t.posterPath) ? (
                        <img src={imgUrl(t.posterPath)!} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center"><Tv className="w-8 h-8 text-slate-600" /></div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-300 group-hover:text-white truncate mt-2 transition">{t.title}</h4>
                    {t.firstAirDate && <span className="text-[10px] text-slate-500">{t.firstAirDate.split("-")[0]}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CAST */}
          {(category === "all" || category === "cast") && results.cast?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Camera className="w-4 h-4 text-pink-400" />} title="Cast & Actors" count={results.cast.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.cast.map((p: any) => (
                  <PersonCard key={p.id} person={p} imgUrl={imgUrl} accentColor="pink" />
                ))}
              </div>
            </section>
          )}

          {/* CREW */}
          {(category === "all" || category === "crew") && results.crew?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Clapperboard className="w-4 h-4 text-amber-400" />} title="Directors & Crew" count={results.crew.length} />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.crew.map((p: any) => (
                  <PersonCard key={p.id} person={p} imgUrl={imgUrl} accentColor="amber" />
                ))}
              </div>
            </section>
          )}

          {/* CINEVERSE CRITICS (Platform Users) */}
          {(category === "all" || category === "people") && results.people?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<UserCheck className="w-4 h-4 text-brand-purple" />} title="CineVerse Critics" count={results.people.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.people.map((u: any) => (
                  <Link key={u.id} href={`/dashboard/profile/${u.user?.id || u.id}`} className="group">
                    <GlassCard hoverGlow={false} className="p-4 flex items-center gap-4 border-white/5 bg-slate-900/60 hover:border-brand-purple/30 transition-all">
                      <img
                        src={u.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u.username}
                        alt={u.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10 group-hover:border-brand-purple/60 transition"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-white group-hover:text-brand-purple transition block truncate">
                          {u.username}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {u.user?._count?.followers || 0} followers · {u.user?._count?.reviews || 0} reviews
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-purple transition shrink-0" />
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* COMMUNITIES */}
          {(category === "all" || category === "communities") && results.communities?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Globe className="w-4 h-4 text-green-400" />} title="Communities" count={results.communities.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.communities.map((c: any) => (
                  <Link key={c.id} href={`/dashboard/community/${c.slug}`} className="group">
                    <GlassCard hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 hover:border-green-500/30 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                          <Globe className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-green-400 transition truncate">{c.name}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{c.description}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block font-semibold uppercase">{c._count?.members || 0} Members</span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* POSTS / DISCUSSIONS */}
          {(category === "all" || category === "posts") && results.posts?.length > 0 && (
            <section className="space-y-4">
              <SectionHeader icon={<Megaphone className="w-4 h-4 text-brand-gold" />} title="Discussions" count={results.posts.length} />
              <div className="space-y-3">
                {results.posts.map((p: any) => (
                  <Link key={p.id} href={`/dashboard/post/${p.id}`} className="group">
                    <GlassCard hoverGlow={false} className="p-4 border-white/5 bg-slate-900/60 hover:border-white/15 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={p.user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user?.id}`}
                          alt="avatar"
                          className="w-7 h-7 rounded-full border border-white/10"
                        />
                        <span className="text-xs font-bold text-slate-200">{p.user?.profile?.username || "Unknown"}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 group-hover:text-white transition">{p.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-semibold">
                        <span>{p._count?.reactions || 0} Reactions</span>
                        <span>{p._count?.comments || 0} Comments</span>
                      </div>
                    </GlassCard>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {searched && results.totalCount === 0 && (
            <div className="text-center py-24">
              <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-white font-bold text-lg">No results for "{query}"</p>
              <p className="text-slate-500 text-sm mt-2">Try a different term or switch categories.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
        {icon}
        <span>{title}</span>
      </div>
      <span className="ml-auto text-xs text-slate-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full">{count} results</span>
    </div>
  );
}

function PersonCard({ person, imgUrl, accentColor }: { person: any; imgUrl: any; accentColor: string }) {
  const accent = accentColor === "pink"
    ? "group-hover:border-pink-500/50"
    : "group-hover:border-amber-500/50";

  return (
    <div className="group cursor-default">
      <GlassCard hoverGlow={false} className={`p-4 border-white/5 bg-slate-900/60 transition-all ${accent}`}>
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 shrink-0">
            {imgUrl(person.profilePath) ? (
              <img
                src={imgUrl(person.profilePath)}
                alt={person.name}
                className="w-full h-full object-cover rounded-xl border border-white/10"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate">{person.name}</h4>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${accentColor === "pink" ? "text-pink-400" : "text-amber-400"}`}>
              {person.knownFor || "Film Industry"}
            </span>
            {person.popularMovies?.length > 0 && (
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                Known for: {person.popularMovies.join(", ")}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
