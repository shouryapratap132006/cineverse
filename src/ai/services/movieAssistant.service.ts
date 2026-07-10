// ============================================================
// Movie Assistant Service — streaming companion for every movie
// ============================================================

import { orchestrateStream, orchestrateCompletion } from "../orchestrator";
import { getMovieCompanionSystemPrompt, MOVIE_COMPANION_SUGGESTED_PROMPTS } from "../prompts/movie.prompts";
import type { AIMessage, MovieCompanionRequest, MovieCompanionSuggestedPrompt } from "../types";

export class MovieAssistantService {
  /**
   * Stream a response from the movie companion
   */
  async streamResponse(request: MovieCompanionRequest): Promise<ReadableStream<Uint8Array>> {
    const systemPrompt = getMovieCompanionSystemPrompt({
      title: request.movieTitle,
      overview: request.movieOverview ?? "No overview available",
      year: request.year,
      genres: request.genres,
      director: request.director,
    });

    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      ...request.messages,
    ];

    return orchestrateStream({
      messages,
      temperature: 0.8,
      maxTokens: 1024,
    });
  }

  /**
   * Get suggested prompts for a movie
   */
  getSuggestedPrompts(): MovieCompanionSuggestedPrompt[] {
    return MOVIE_COMPANION_SUGGESTED_PROMPTS;
  }

  /**
   * Generate a quick one-shot insight (non-streaming)
   */
  async getQuickInsight(
    movieTitle: string,
    movieOverview: string,
    question: string
  ): Promise<string> {
    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content: getMovieCompanionSystemPrompt({ title: movieTitle, overview: movieOverview }),
        },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      maxTokens: 512,
    });
    return response.content;
  }
}

export const movieAssistantService = new MovieAssistantService();
