import { MOCK_MOVIES, Movie } from "./mockData";

const TMDB_API_KEY = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_TMDB_API_KEY : undefined;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Map TMDB movie response to our unified Movie interface
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

  // Find YouTube trailer
  const videos = tmdbMovie.videos?.results || [];
  const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube") || videos.find((v: any) => v.site === "YouTube");
  const trailerUrl = trailer ? trailer.key : "zSWdZVtXT7E"; // Fallback to Interstellar trailer

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
    streamingPlatforms: ["Netflix", "Prime Video", "Apple TV+"], // Fallback streaming options
    production: tmdbMovie.production_companies?.map((pc: any) => pc.name) || []
  };
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query) return MOCK_MOVIES;

  if (TMDB_API_KEY) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error("TMDB network response failed");
      const data = await response.json();
      
      // Fetch details for each movie to get runtime, credits etc.
      const detailedMovies = await Promise.all(
        data.results.slice(0, 10).map(async (movie: any) => {
          try {
            const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              return mapTmdbToMovie(detailData);
            }
          } catch (e) {
            // Ignore single failures and return mapped basic movie data
          }
          return {
            id: String(movie.id),
            title: movie.title,
            overview: movie.overview || "",
            rating: Number(movie.vote_average?.toFixed(1)) || 0,
            releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
            releaseDate: movie.release_date || "",
            backdropUrl: movie.backdrop_path ? `${IMAGE_BASE_URL}/w1280${movie.backdrop_path}` : "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200",
            posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}/w500${movie.poster_path}` : "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
            genres: ["Drama"],
            runtime: 120,
            cast: [],
            crew: [],
            reviews: [],
            trailerUrl: "zSWdZVtXT7E",
            streamingPlatforms: ["Netflix"],
            production: []
          };
        })
      );
      return detailedMovies;
    } catch (error) {
      console.error("TMDB API Error:", error);
    }
  }

  // Local Search Fallback
  return MOCK_MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.genres.some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
      m.cast.some((c) => c.name.toLowerCase().includes(query.toLowerCase())) ||
      m.crew.some((cr) => cr.name.toLowerCase().includes(query.toLowerCase()))
  );
}

export async function getMovieDetails(id: string): Promise<Movie | null> {
  if (TMDB_API_KEY) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,similar`
      );
      if (response.ok) {
        const data = await response.json();
        return mapTmdbToMovie(data);
      }
    } catch (error) {
      console.error("TMDB API Details Error:", error);
    }
  }

  // Local Details Fallback
  const localMovie = MOCK_MOVIES.find((m) => m.id === id);
  return localMovie || null;
}

export async function getTrendingMovies(): Promise<Movie[]> {
  if (TMDB_API_KEY) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        // Fetch detailed info for trending
        const detailedMovies = await Promise.all(
          data.results.slice(0, 10).map(async (movie: any) => {
            const detailRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              return mapTmdbToMovie(detailData);
            }
            return null;
          })
        );
        return detailedMovies.filter((m) => m !== null) as Movie[];
      }
    } catch (error) {
      console.error("TMDB Trending Error:", error);
    }
  }

  return MOCK_MOVIES;
}
