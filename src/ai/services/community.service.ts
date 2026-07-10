// ============================================================
// Community Intelligence Service
// ============================================================

import { orchestrateCompletion, parseAIJson } from "../orchestrator";
import { aiCache } from "../utils/cache";
import { getCommunitySummaryPrompt } from "../prompts/community.prompts";
import type { CommunitySummaryRequest, CommunitySummary } from "../types";

export class CommunityService {
  async generateSummary(request: CommunitySummaryRequest): Promise<CommunitySummary> {
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = aiCache.key("community_summary", request.communityId, request.type, today);

    const cached = await aiCache.get<CommunitySummary>(cacheKey);
    if (cached) return cached;

    const prompt = getCommunitySummaryPrompt({
      communityName: request.communityName,
      type: request.type,
      recentPosts: request.recentPosts,
      topMovies: request.topMovies,
      memberCount: request.memberCount,
    });

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are CineVerse's community AI journalist. Generate engaging community summaries as valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 1536,
    });

    const summary = parseAIJson<CommunitySummary>(response.content);
    
    // Cache daily summaries for 6 hours, weekly for 24
    const ttl = request.type === "daily" ? 60 * 60 * 6 : 60 * 60 * 24;
    await aiCache.set(cacheKey, summary, ttl);
    
    return summary;
  }
}

export const communityService = new CommunityService();
