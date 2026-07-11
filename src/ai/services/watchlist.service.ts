// ============================================================
// Watchlist Builder Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { getWatchlistBuilderPrompt } from "../prompts/watchlist.prompts";
import type { WatchlistBuilderRequest, GeneratedWatchlist } from "../types";

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
      return parseAIJson<GeneratedWatchlist>(response.content);
    } catch (parseError) {
      console.warn("[WatchlistService] JSON parse failed, retrying with compact prompt:", parseError);
      return this.buildWatchlistCompact(request, count);
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
}

export const watchlistService = new WatchlistService();
