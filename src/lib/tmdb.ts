"use server";

import { MOCK_MOVIES, Movie } from "./mockData";
import fs from "fs";
import path from "path";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Utility helper to fetch with a network timeout to prevent page loading hangs
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Persistent file-based cache file path
const CACHE_FILE = path.join(process.cwd(), "src/lib/tmdb-cache.json");

// In-memory cache structures
const detailsCache = new Map<string, Movie>();
const listCache = new Map<string, { data: Movie[]; expires: number }>();
const CACHE_TTL_LISTS = 1000 * 60 * 10;     // 10 minutes for movie lists

// Load initial details cache from file on startup
try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      detailsCache.set(k, v as Movie);
    }
  }
} catch (e) {
  console.error("Failed to load TMDB cache file:", e);
}

// Function to save details cache to disk asynchronously
function saveCacheToDisk() {
  try {
    const obj: Record<string, Movie> = {};
    detailsCache.forEach((v, k) => {
      obj[k] = v;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save TMDB cache file:", e);
  }
}



function mapTmdbToMovie(tmdbMovie: any): Movie {
  const cast = tmdbMovie.credits?.cast?.slice(0, 5).map((c: any) => ({
    name: c.name,
    character: c.character,
    avatarUrl: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
  })) || [];

  const crew = tmdbMovie.credits?.crew?.filter((cr: any) => cr.job === "Director" || cr.job === "Writer" || cr.job === "Novel" || cr.job === "Original Music Composer").slice(0, 3).map((c: any) => ({
    name: c.name,
    job: c.job
  })) || [];

  const reviews = tmdbMovie.reviews?.results?.slice(0, 3).map((r: any) => ({
    id: r.id,
    user: r.author,
    rating: r.author_details?.rating || 8,
    content: r.content,
    date: new Date(r.created_at).toLocaleDateString(),
    avatarUrl: r.author_details?.avatar_path 
      ? (r.author_details.avatar_path.startsWith("/http") 
          ? r.author_details.avatar_path.substring(1) 
          : `${IMAGE_BASE_URL}/w185${r.author_details.avatar_path}`)
      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
  })) || [];

  const videos = tmdbMovie.videos?.results || [];
  const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || videos.find((v: any) => v.site === "YouTube");
  const trailerUrl = trailer ? trailer.key : "zSWdZVtXT7E";

  // Parse real streaming platforms from TMDB watch/providers
  const results = tmdbMovie["watch/providers"]?.results || {};
  const countryCode = Object.keys(results)[0]; // Fallback to first available country results
  const providersList = results.US?.flatrate || results[countryCode]?.flatrate || [];
  const streamingPlatforms = providersList.slice(0, 3).map((p: any) => p.provider_name);
  if (streamingPlatforms.length === 0) {
    streamingPlatforms.push("Purchase Only / Rent");
  }

  return {
    id: String(tmdbMovie.id),
    title: tmdbMovie.title,
    overview: tmdbMovie.overview || "No overview available.",
    rating: Number(tmdbMovie.vote_average?.toFixed(1)) || 0,
    releaseYear: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
    releaseDate: tmdbMovie.release_date 
      ? new Date(tmdbMovie.release_date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) 
      : "Unknown Release Date",
    backdropUrl: tmdbMovie.backdrop_path ? `${IMAGE_BASE_URL}/w1280${tmdbMovie.backdrop_path}` : "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200",
    posterUrl: tmdbMovie.poster_path ? `${IMAGE_BASE_URL}/w500${tmdbMovie.poster_path}` : "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    genres: tmdbMovie.genres?.map((g: any) => g.name) || ["Drama"],
    runtime: tmdbMovie.runtime || 120,
    cast,
    crew,
    reviews,
    trailerUrl,
    streamingPlatforms,
    production: tmdbMovie.production_companies?.map((pc: any) => pc.name) || []
  };
}

function getFallbackMovies(): Movie[] {
  return MOCK_MOVIES.slice(0, 8);
}

async function fetchDetailedMovies(results: any[]): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  let updatedCache = false;
  const detailedMovies = await Promise.all(
    results.slice(0, 10).map(async (movie: any) => {
      const cached = detailsCache.get(String(movie.id));
      if (cached) return cached;

      try {
        const detailRes = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,watch/providers`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          const mapped = mapTmdbToMovie(detailData);
          detailsCache.set(String(movie.id), mapped);
          updatedCache = true;
          return mapped;
        }
      } catch (e) {}
      return null;
    })
  );
  if (updatedCache) {
    saveCacheToDisk();
  }
  return detailedMovies.filter((m) => m !== null) as Movie[];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  if (!query) return getTrendingMovies();

  try {
    const response = await fetchWithTimeout(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB API Search Error:", error);
  }
  return getFallbackMovies();
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
  const cached = detailsCache.get(id);
  if (cached) {
    return cached;
  }

  if (!TMDB_API_KEY) return getFallbackMovies()[0] || null;
  try {
    const response = await fetchWithTimeout(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,similar,watch/providers`
    );
    if (response.ok) {
      const data = await response.json();
      const mapped = mapTmdbToMovie(data);
      detailsCache.set(id, mapped);
      saveCacheToDisk();
      return mapped;
    }
  } catch (error) {
    console.error("TMDB API Details Error:", error);
  }
  return null;
}

async function fetchCachedList(key: string, fetchFn: () => Promise<Movie[]>): Promise<Movie[]> {
  const now = Date.now();
  const cached = listCache.get(key);
  if (cached && cached.expires > now) {
    return cached.data;
  }
  const data = await fetchFn();
  listCache.set(key, { data, expires: now + CACHE_TTL_LISTS });
  return data;
}

export async function getTrendingMovies(): Promise<Movie[]> {
  return fetchCachedList("trending", async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Trending Error:", error);
    }
    return getFallbackMovies();
  });
}

export async function getPopularMovies(): Promise<Movie[]> {
  return fetchCachedList("popular", async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Popular Error:", error);
    }
    return getFallbackMovies();
  });
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  return fetchCachedList("top_rated", async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Top Rated Error:", error);
    }
    return getFallbackMovies();
  });
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  return fetchCachedList("upcoming", async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Upcoming Error:", error);
    }
    return getFallbackMovies();
  });
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  return fetchCachedList("now_playing", async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Now Playing Error:", error);
    }
    return getFallbackMovies();
  });
}

export async function getRecommendations(id: string): Promise<Movie[]> {
  return fetchCachedList(`recommendations_${id}`, async () => {
    if (!TMDB_API_KEY) return getFallbackMovies();
    try {
      const response = await fetchWithTimeout(`${TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
      if (response.ok) {
        const data = await response.json();
        return fetchDetailedMovies(data.results);
      }
    } catch (error) {
      console.error("TMDB Recommendations Error:", error);
    }
    return getFallbackMovies();
  });
}
