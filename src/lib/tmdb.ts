import { MOCK_MOVIES } from "./mockData";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface Movie {
  id: string;
  title: string;
  overview: string;
  rating: number;
  releaseYear: number;
  releaseDate: string;
  backdropUrl: string;
  posterUrl: string;
  genres: string[];
  runtime: number;
  cast: { name: string; character: string; avatarUrl: string }[];
  crew: { name: string; job: string }[];
  reviews: { id: string; user: string; rating: number; content: string; date: string; avatarUrl: string }[];
  trailerUrl: string;
  streamingPlatforms: string[];
  production: string[];
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
  const detailedMovies = await Promise.all(
    results.slice(0, 10).map(async (movie: any) => {
      try {
        const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,watch/providers`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          return mapTmdbToMovie(detailData);
        }
      } catch (e) {}
      return null;
    })
  );
  return detailedMovies.filter((m) => m !== null) as Movie[];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  if (!query) return getTrendingMovies();

  try {
    const response = await fetch(
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
  if (!TMDB_API_KEY) return getFallbackMovies()[0] || null;
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,similar,watch/providers`
    );
    if (response.ok) {
      const data = await response.json();
      return mapTmdbToMovie(data);
    }
  } catch (error) {
    console.error("TMDB API Details Error:", error);
  }
  return null;
}

export async function getTrendingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Trending Error:", error);
  }
  return getFallbackMovies();
}

export async function getPopularMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Popular Error:", error);
  }
  return getFallbackMovies();
}

export async function getTopRatedMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Top Rated Error:", error);
  }
  return getFallbackMovies();
}

export async function getUpcomingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Upcoming Error:", error);
  }
  return getFallbackMovies();
}

export async function getNowPlayingMovies(): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Now Playing Error:", error);
  }
  return getFallbackMovies();
}

export async function getRecommendations(id: string): Promise<Movie[]> {
  if (!TMDB_API_KEY) return getFallbackMovies();
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (response.ok) {
      const data = await response.json();
      return fetchDetailedMovies(data.results);
    }
  } catch (error) {
    console.error("TMDB Recommendations Error:", error);
  }
  return getFallbackMovies();
}
