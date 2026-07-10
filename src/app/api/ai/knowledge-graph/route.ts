// ============================================================
// POST /api/ai/knowledge-graph — Movie knowledge graph
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { orchestrateCompletion, parseAIJson } from "@/ai/orchestrator";
import { aiCache } from "@/ai/utils/cache";
import { getKnowledgeGraphPrompt } from "@/ai/prompts/movie.prompts";
import type { KnowledgeGraph } from "@/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, movieTitle, year, director, cast, genres } = body;

    if (!movieTitle) {
      return NextResponse.json({ error: "movieTitle is required" }, { status: 400 });
    }

    const cacheKey = aiCache.key("knowledge_graph", movieId ?? movieTitle);
    const cached = await aiCache.get<KnowledgeGraph>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const prompt = getKnowledgeGraphPrompt({ title: movieTitle, year, director, cast, genres });

    const response = await orchestrateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a cinema knowledge graph generator. Create insightful connections between films, people, and themes. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      maxTokens: 2048,
    });

    const graph = parseAIJson<KnowledgeGraph>(response.content);
    await aiCache.set(cacheKey, graph, 60 * 60 * 72); // 72 hour cache

    return NextResponse.json(graph);
  } catch (error) {
    console.error("[/api/ai/knowledge-graph]", error);
    const message = error instanceof Error ? error.message : "Knowledge graph error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
