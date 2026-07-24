// ============================================================
// GET /api/ai/daily — AI Daily Page content
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { orchestrateCompletion, parseAIJson } from "@/ai/orchestrator";
import { aiCache } from "@/ai/utils/cache";
import { getDailyPagePrompt } from "@/ai/prompts/daily.prompts";
import type { DailyContent } from "@/ai/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use today's date as cache key — same content for all users each day
    const today = new Date().toISOString().split("T")[0];
    const cacheKey = aiCache.key("daily_content_v2", today);

    const cached = await aiCache.get<DailyContent>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const dateStr = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const prompt = getDailyPagePrompt(dateStr);

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are CineVerse's daily content curator. Generate fresh, genuinely interesting cinema content. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      maxTokens: 2048,
    });

    const content = parseAIJson<DailyContent>(response.content);
    
    // Resolve real TMDB movie details to prevent empty poster path or wrong IDs
    const { resolveMovieMetadata } = await import("@/lib/tmdb");
    if (content.todaysMovie) {
      const resolved = await resolveMovieMetadata(content.todaysMovie.title, content.todaysMovie.year);
      if (resolved) {
        content.todaysMovie.tmdbId = resolved.tmdbId;
        content.todaysMovie.posterPath = resolved.posterPath;
        content.todaysMovie.year = resolved.year;
      }
    }
    if (content.hiddenGem) {
      const resolved = await resolveMovieMetadata(content.hiddenGem.title, content.hiddenGem.year);
      if (resolved) {
        content.hiddenGem.tmdbId = resolved.tmdbId;
        content.hiddenGem.posterPath = resolved.posterPath;
        content.hiddenGem.year = resolved.year;
      }
    }
    
    // Cache for 12 hours — fresh daily content
    await aiCache.set(cacheKey, content, 60 * 60 * 12);

    return NextResponse.json(content);
  } catch (error) {
    console.error("[/api/ai/daily]", error);
    const message = error instanceof Error ? error.message : "Daily content error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
