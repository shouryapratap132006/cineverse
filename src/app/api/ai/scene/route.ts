// ============================================================
// POST /api/ai/scene — Scene Explorer analysis
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { orchestrateCompletion, parseAIJson } from "@/ai/orchestrator";
import { aiCache } from "@/ai/utils/cache";
import { getSceneAnalysisPrompt } from "@/ai/prompts/movie.prompts";
import type { SceneAnalysis } from "@/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, movieTitle, sceneName, sceneDescription } = body;

    if (!movieTitle || !sceneName) {
      return NextResponse.json({ error: "movieTitle and sceneName are required" }, { status: 400 });
    }

    const cacheKey = aiCache.key("scene_analysis", movieId ?? movieTitle, sceneName);
    const cached = await aiCache.get<SceneAnalysis>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const prompt = getSceneAnalysisPrompt(movieTitle, sceneName, sceneDescription);

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a film professor and cinematic analyst. Analyze scenes with academic precision and genuine insight. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2048,
    });

    const analysis = parseAIJson<SceneAnalysis>(response.content);
    await aiCache.set(cacheKey, analysis, 60 * 60 * 48); // 48 hour cache for scene analysis

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[/api/ai/scene]", error);
    const message = error instanceof Error ? error.message : "Scene analysis error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
