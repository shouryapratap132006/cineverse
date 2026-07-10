// ============================================================
// Taste / Movie DNA Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { aiCache } from "../utils/cache";
import { getMovieDNAPrompt, getProfileSummaryPrompt } from "../prompts/taste.prompts";
import type { MovieDNA, UserTasteProfile } from "../types";

export class TasteService {
  async generateMovieDNA(profile: UserTasteProfile, userId: string, username: string): Promise<MovieDNA> {
    const cacheKey = aiCache.key("movie_dna", userId, profile.favoriteMovies?.length?.toString() ?? "0");
    
    const cached = await aiCache.get<MovieDNA>(cacheKey);
    if (cached) return cached;

    const prompt = getMovieDNAPrompt(profile, username);

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are CineVerse's taste analysis engine. Always respond with valid JSON only. Make the analysis feel genuinely personal and insightful.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    const dna = parseAIJson<MovieDNA>(response.content);
    await aiCache.set(cacheKey, dna, 60 * 60 * 24); // 24 hour cache
    return dna;
  }

  async generateProfileSummary(profile: UserTasteProfile, username: string): Promise<string> {
    const cacheKey = aiCache.key("profile_summary", username);
    const cached = await aiCache.get<string>(cacheKey);
    if (cached) return cached;

    const prompt = getProfileSummaryPrompt(profile, username);
    const response = await orchestrateCompletion({
      messages: [
        { role: "system", content: "You are a film critic writing profile summaries. Return only the paragraph, no extra text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.75,
      maxTokens: 512,
    });

    const summary = response.content.trim();
    await aiCache.set(cacheKey, summary, 60 * 60 * 24);
    return summary;
  }
}

export const tasteService = new TasteService();
