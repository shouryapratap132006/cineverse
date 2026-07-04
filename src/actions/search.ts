"use server";

import { db } from "@/lib/db";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function searchTMDBMovies(query: string) {
  if (!TMDB_API_KEY) return [];
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 8).map((m: any) => ({
      id: String(m.id),
      title: m.title,
      overview: m.overview,
      posterPath: m.poster_path,
      backdropPath: m.backdrop_path,
      releaseDate: m.release_date,
      rating: m.vote_average,
      type: "movie"
    }));
  } catch { return []; }
}

async function searchTMDBPeople(query: string) {
  if (!TMDB_API_KEY) return [];
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 8).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      profilePath: p.profile_path,
      knownFor: p.known_for_department,
      popularMovies: (p.known_for || []).slice(0, 2).map((m: any) => m.title || m.name).filter(Boolean),
      type: "person"
    }));
  } catch { return []; }
}

async function searchTMDBByKeyword(query: string) {
  if (!TMDB_API_KEY) return { tv: [] };
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return { tv: [] };
    const data = await res.json();
    return {
      tv: (data.results || []).slice(0, 5).map((t: any) => ({
        id: String(t.id),
        title: t.name,
        overview: t.overview,
        posterPath: t.poster_path,
        firstAirDate: t.first_air_date,
        rating: t.vote_average,
        type: "tv"
      }))
    };
  } catch { return { tv: [] }; }
}

export async function globalSearch(query: string, category: string = "all") {
  if (!query || query.trim().length < 2) {
    return { success: false, error: "Query too short" };
  }

  try {
    const [
      tmdbMovies,
      tmdbPeople,
      tmdbTV,
      localUsers,
      localCommunities,
      localPosts,
    ] = await Promise.all([
      (category === "all" || category === "movies" || category === "tv") ? searchTMDBMovies(query) : Promise.resolve([]),
      (category === "all" || category === "cast" || category === "crew" || category === "people") ? searchTMDBPeople(query) : Promise.resolve([]),
      (category === "all" || category === "tv") ? searchTMDBByKeyword(query) : Promise.resolve({ tv: [] }),
      (category === "all" || category === "people") ? db.profile.findMany({
        where: { username: { contains: query, mode: "insensitive" } },
        take: 8,
        include: {
          user: { select: { id: true, _count: { select: { followers: true, reviews: true } } } }
        }
      }) : Promise.resolve([]),
      (category === "all" || category === "communities") ? db.community.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        take: 6,
        include: { _count: { select: { members: true } } }
      }) : Promise.resolve([]),
      (category === "all" || category === "posts") ? db.post.findMany({
        where: { content: { contains: query, mode: "insensitive" } },
        take: 6,
        include: {
          user: { include: { profile: true } },
          _count: { select: { reactions: true, comments: true } }
        },
        orderBy: { createdAt: "desc" }
      }) : Promise.resolve([]),
    ]);

    const people = tmdbPeople.map((p: any) => ({
      ...p,
      department: p.knownFor === "Acting" ? "Cast" : p.knownFor === "Directing" ? "Director" : p.knownFor
    }));

    const cast = people.filter((p: any) => p.knownFor === "Acting");
    const crew = people.filter((p: any) => p.knownFor !== "Acting");

    return {
      success: true,
      results: {
        movies: tmdbMovies,
        tv: (tmdbTV as any).tv || [],
        people: localUsers,    // CineVerse platform users
        cast,                  // TMDB actors
        crew,                  // TMDB directors/crew
        communities: localCommunities,
        posts: localPosts,
        totalCount:
          tmdbMovies.length +
          ((tmdbTV as any).tv || []).length +
          localUsers.length +
          people.length +
          localCommunities.length +
          localPosts.length
      }
    };
  } catch (error: any) {
    console.error("Search error:", error);
    return { success: false, error: error.message };
  }
}
