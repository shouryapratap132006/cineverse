// ============================================================
// Recommendation Engine Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { aiCache } from "../utils/cache";
import {
  getRecommendationSystemPrompt,
  getRecommendationPrompt,
} from "../prompts/recommendation.prompts";
import type {
  RecommendationRequest,
  RecommendationSet,
  RecommendationType,
  UserTasteProfile,
} from "../types";
import { resolveMovieMetadata } from "@/lib/tmdb";

export class RecommendationService {
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationSet> {
    const cacheKey = aiCache.key(
      "recommendations_v3",
      request.userId,
      request.type,
      // Include profile hash for cache invalidation
      (request.userProfile.favoriteMovies?.length ?? 0).toString()
    );

    const cached = await aiCache.get<RecommendationSet>(cacheKey);
    if (cached) return cached;

    const prompt = getRecommendationPrompt(request.type, request.userProfile);

    const response = await orchestrateCompletion({
      messages: [
        { role: "system", content: getRecommendationSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      maxTokens: 2048,
    });

    const result = parseAIJson<RecommendationSet>(response.content);

    // Resolve real TMDB movie details to prevent empty poster path or wrong IDs
    if (result && result.movies && result.movies.length > 0) {
      const resolvedMovies = await Promise.all(
        result.movies.map(async (movie) => {
          const resolved = await resolveMovieMetadata(movie.title, movie.year);
          if (resolved) {
            return {
              ...movie,
              tmdbId: resolved.tmdbId,
              posterPath: resolved.posterPath,
              genres: resolved.genres,
              rating: resolved.rating,
              year: resolved.year,
            };
          }
          return movie;
        })
      );
      result.movies = resolvedMovies;
    }

    await aiCache.set(cacheKey, result, 60 * 60 * 4); // 4 hour cache
    return result;
  }

  async getAllRecommendations(
    userId: string,
    userProfile: UserTasteProfile
  ): Promise<RecommendationSet[]> {
    const types: RecommendationType[] = [
      "today_pick",
      "hidden_gems",
      "because_you_loved",
      "mind_bending",
      "weekend_marathon",
      "late_night",
      "international",
      "comfort_movies",
    ];

    const results = await Promise.allSettled(
      types.map((type) =>
        this.getRecommendations({ userId, type, userProfile })
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<RecommendationSet> => r.status === "fulfilled")
      .map((r) => r.value);
  }
}

export const recommendationService = new RecommendationService();
