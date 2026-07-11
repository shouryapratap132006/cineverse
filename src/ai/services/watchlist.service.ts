// ============================================================
// Watchlist Builder Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { getWatchlistBuilderPrompt } from "../prompts/watchlist.prompts";
import type { WatchlistBuilderRequest, GeneratedWatchlist } from "../types";
import { resolveMovieMetadata } from "@/lib/tmdb";

export class WatchlistService {
  async buildWatchlist(request: WatchlistBuilderRequest): Promise<GeneratedWatchlist> {
    const count = request.count ?? 8;
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

    try {
      const parsed = parseAIJson<GeneratedWatchlist>(response.content);
      return this.resolveWatchlistMovies(parsed);
    } catch (parseError) {
      console.warn("[WatchlistService] JSON parse failed, retrying with compact prompt:", parseError);
      const parsedCompact = await this.buildWatchlistCompact(request, count);
      return this.resolveWatchlistMovies(parsedCompact);
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

  private async resolveWatchlistMovies(watchlist: GeneratedWatchlist): Promise<GeneratedWatchlist> {
    if (watchlist && watchlist.movies && watchlist.movies.length > 0) {
      const resolvedMovies = await Promise.all(
        watchlist.movies.map(async (movie) => {
          const resolved = await resolveMovieMetadata(movie.title, movie.year);
          if (resolved) {
            return {
              ...movie,
              tmdbId: resolved.tmdbId,
              posterPath: resolved.posterPath,
              genres: resolved.genres,
              year: resolved.year,
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
