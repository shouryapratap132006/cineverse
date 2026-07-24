// ============================================================
// Watchlist Builder Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { getWatchlistBuilderPrompt } from "../prompts/watchlist.prompts";
import type { WatchlistBuilderRequest, GeneratedWatchlist } from "../types";
import { resolveMovieMetadata, searchMovies, getPopularMovies } from "@/lib/tmdb";

export class WatchlistService {
  async buildWatchlist(request: WatchlistBuilderRequest): Promise<GeneratedWatchlist> {
    const count = request.count ?? 8;
    
    try {
      const prompt = getWatchlistBuilderPrompt(
        request.prompt,
        request.userProfile,
        count
      );

      const response = await orchestrateCompletion({
        messages: [
          {
            role: "system",
            content:
              "You are an expert film curator. Build curated watchlists as valid JSON. Never respond with anything other than the JSON object.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        maxTokens: 4096,
      });

      if (!response.content?.trim()) {
        throw new Error("AI returned an empty watchlist response");
      }

      const parsed = parseAIJson<GeneratedWatchlist>(response.content);
      if (!parsed || !parsed.movies || parsed.movies.length === 0) {
        throw new Error("AI returned no movies in watchlist");
      }
      return await this.resolveWatchlistMovies(parsed);
    } catch (primaryError) {
      console.warn("[WatchlistService] Primary AI generation failed, trying compact AI prompt:", primaryError);
      try {
        const parsedCompact = await this.buildWatchlistCompact(request, count);
        if (!parsedCompact || !parsedCompact.movies || parsedCompact.movies.length === 0) {
          throw new Error("Compact AI returned no movies");
        }
        return await this.resolveWatchlistMovies(parsedCompact);
      } catch (fallbackError) {
        console.warn("[WatchlistService] AI unavailable, building dynamic TMDB search watchlist:", fallbackError);
        return await this.buildCuratedFallback(request.prompt);
      }
    }
  }

  private async buildWatchlistCompact(
    request: WatchlistBuilderRequest,
    count: number
  ): Promise<GeneratedWatchlist> {
    const compactCount = Math.min(count, 5);
    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "Return ONLY a single valid JSON object. No markdown, no commentary.",
        },
        {
          role: "user",
          content: `Build a ${compactCount}-film watchlist for: "${request.prompt}". JSON shape: {"name":"","description":"","mood":"","emoji":"","estimatedRuntime":0,"movies":[{"tmdbId":"","title":"","year":0,"posterPath":"","overview":"","genres":[],"runtime":0,"reason":"","orderNote":""}]}`,
        },
      ],
      temperature: 0.5,
      maxTokens: 4096,
    });

    if (!response.content?.trim()) {
      throw new Error("AI returned an empty watchlist response on retry");
    }

    return parseAIJson<GeneratedWatchlist>(response.content);
  }

  private async buildCuratedFallback(prompt: string): Promise<GeneratedWatchlist> {
    try {
      const tmdbMovies = await searchMovies(prompt);
      const moviesList = tmdbMovies && tmdbMovies.length > 0 ? tmdbMovies : await getPopularMovies();
      const topMovies = moviesList.slice(0, 8);

      const watchlist: GeneratedWatchlist = {
        name: `Watchlist: ${prompt.slice(0, 40)}`,
        description: `Curated film selection matching "${prompt}".`,
        mood: "Cinematic",
        emoji: "🎬",
        estimatedRuntime: topMovies.reduce((acc, m) => acc + (m.runtime || 110), 0),
        movies: topMovies.map((m, idx) => ({
          tmdbId: String(m.id),
          title: m.title,
          year: m.releaseYear || 2024,
          posterPath: m.posterUrl ? m.posterUrl.replace("/api/tmdb/img?path=/t/p/w500", "") : "",
          overview: m.overview || `Curated recommendation for "${prompt}".`,
          genres: m.genres || ["Cinema"],
          runtime: m.runtime || 120,
          reason: `Highly rated match for "${prompt}".`,
          orderNote: idx === 0 ? "Featured Choice" : `Recommendation #${idx + 1}`,
        })),
      };

      return watchlist;
    } catch (e) {
      // Emergency static fallback
      return {
        name: `Watchlist: ${prompt.slice(0, 30)}`,
        description: `Curated films matching "${prompt}".`,
        mood: "Cinematic",
        emoji: "🎬",
        estimatedRuntime: 620,
        movies: [
          { tmdbId: "27205", title: "Inception", year: 2010, posterPath: "/oYuLEW9zgzAkhFUB2b4B5nyBKA7.jpg", overview: "A thief who steals corporate secrets through dream-sharing technology.", genres: ["Action", "Sci-Fi"], runtime: 148, reason: "Cinematic masterpiece.", orderNote: "Featured Choice" },
          { tmdbId: "157336", title: "Interstellar", year: 2014, posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", overview: "A team of explorers travel through a wormhole in space.", genres: ["Adventure", "Drama"], runtime: 169, reason: "Epic cosmic journey.", orderNote: "Recommendation #2" },
        ],
      };
    }
  }

  private async resolveWatchlistMovies(watchlist: GeneratedWatchlist): Promise<GeneratedWatchlist> {
    if (watchlist && watchlist.movies && watchlist.movies.length > 0) {
      const resolvedMovies = await Promise.all(
        watchlist.movies.map(async (movie) => {
          const resolved = await resolveMovieMetadata(movie.title, movie.year);
          if (resolved) {
            return {
              ...movie,
              tmdbId: resolved.tmdbId,
              posterPath: resolved.posterPath || movie.posterPath,
              genres: resolved.genres.length > 0 ? resolved.genres : movie.genres,
              year: resolved.year || movie.year,
            };
          }
          return movie;
        })
      );
      watchlist.movies = resolvedMovies;
    }
    return watchlist;
  }
}

export const watchlistService = new WatchlistService();
