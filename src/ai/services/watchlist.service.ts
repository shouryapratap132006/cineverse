// ============================================================
// Watchlist Builder Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { getWatchlistBuilderPrompt } from "../prompts/watchlist.prompts";
import type { WatchlistBuilderRequest, GeneratedWatchlist } from "../types";

export class WatchlistService {
  async buildWatchlist(request: WatchlistBuilderRequest): Promise<GeneratedWatchlist> {
    const prompt = getWatchlistBuilderPrompt(
      request.prompt,
      request.userProfile,
      request.count ?? 8
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
      maxTokens: 3000,
    });

    return parseAIJson<GeneratedWatchlist>(response.content);
  }
}

export const watchlistService = new WatchlistService();
