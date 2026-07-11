// ============================================================
// Semantic Search Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { aiCache } from "../utils/cache";
import { getSemanticSearchPrompt } from "../prompts/search.prompts";
import type { SemanticSearchRequest, SemanticSearchResult } from "../types";
import { resolveMovieMetadata } from "@/lib/tmdb";

export class SemanticSearchService {
  async search(request: SemanticSearchRequest): Promise<SemanticSearchResult> {
    const cacheKey = aiCache.key("semantic_search_v2", request.query);
    
    const cached = await aiCache.get<SemanticSearchResult>(cacheKey);
    if (cached) return cached;

    const prompt = getSemanticSearchPrompt(request.query);

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are CineVerse's semantic movie search engine. Always respond with valid JSON only. No markdown, no explanations outside the JSON structure.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      maxTokens: 2048,
    });

    const result = parseAIJson<SemanticSearchResult>(response.content);

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
              year: resolved.year,
            };
          }
          return movie;
        })
      );
      result.movies = resolvedMovies;
    }

    await aiCache.set(cacheKey, result, 60 * 60 * 6); // 6 hour cache
    return result;
  }
}

export const semanticSearchService = new SemanticSearchService();
