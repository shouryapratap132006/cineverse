// ============================================================
// POST /api/ai/knowledge-graph — Movie knowledge graph
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { orchestrateCompletion, parseAIJson } from "@/ai/orchestrator";
import { aiCache } from "@/ai/utils/cache";
import { getKnowledgeGraphPrompt } from "@/ai/prompts/movie.prompts";
import type { KnowledgeGraph } from "@/ai/types";

export const runtime = "nodejs";

/** Deterministic fallback when AI is unavailable — always matches the KnowledgeGraph type */
function buildFallbackGraph(
  movieTitle: string,
  director?: string,
  cast?: string[],
  genres?: string[]
): KnowledgeGraph {
  const centerNode: KnowledgeGraph["centerNode"] = {
    id: "movie-0",
    label: movieTitle,
    type: "movie",
    weight: 10,
    description: `The film being explored: ${movieTitle}.`,
    color: "#8B5CF6",
  };

  const nodes: KnowledgeGraph["nodes"] = [];
  const edges: KnowledgeGraph["edges"] = [];

  if (director) {
    nodes.push({ id: "dir-0", label: director, type: "person", weight: 8, color: "#3B82F6", description: "Director" });
    edges.push({ source: "dir-0", target: "movie-0", label: "directed", strength: 9 });
  }

  (cast || []).slice(0, 5).forEach((actor, i) => {
    const id = `actor-${i}`;
    nodes.push({ id, label: actor, type: "person", weight: 6, color: "#06B6D4", description: "Cast member" });
    edges.push({ source: id, target: "movie-0", label: "appears in", strength: 7 });
  });

  (genres || []).slice(0, 3).forEach((g, i) => {
    const id = `genre-${i}`;
    nodes.push({ id, label: g, type: "genre", weight: 5, color: "#F59E0B", description: "Genre" });
    edges.push({ source: "movie-0", target: id, label: "belongs to", strength: 6 });
  });

  // If we have nothing, add a few placeholder themes
  if (nodes.length === 0) {
    ["Drama", "Cinema", "Story"].forEach((t, i) => {
      nodes.push({ id: `theme-${i}`, label: t, type: "theme", weight: 4, color: "#10B981", description: "Theme" });
      edges.push({ source: "movie-0", target: `theme-${i}`, label: "explores", strength: 5 });
    });
  }

  return { centerNode, nodes, edges };
}

export async function POST(req: NextRequest) {
  let movieTitle = "Unknown Movie";
  let director: string | undefined;
  let cast: string[] | undefined;
  let genres: string[] | undefined;
  let movieId: string | undefined;

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    ({ movieId, movieTitle = "Unknown Movie", director, cast, genres } = body);

    if (!movieTitle) {
      return NextResponse.json({ error: "movieTitle is required" }, { status: 400 });
    }

    const cacheKey = aiCache.key("knowledge_graph", movieId ?? movieTitle);
    const cached = await aiCache.get<KnowledgeGraph>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const prompt = getKnowledgeGraphPrompt({ title: movieTitle, year: body.year, director, cast, genres });

    let graph: KnowledgeGraph;

    try {
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

      graph = parseAIJson<KnowledgeGraph>(response.content);

      // Validate minimal structure; fall back if malformed
      if (!graph?.centerNode || !Array.isArray(graph?.nodes)) {
        throw new Error("AI returned malformed graph");
      }
    } catch (aiError) {
      console.warn("[/api/ai/knowledge-graph] AI failed, using fallback:", aiError);
      graph = buildFallbackGraph(movieTitle, director, cast, genres);
    }

    await aiCache.set(cacheKey, graph, 60 * 60 * 72); // 72 hour cache

    return NextResponse.json(graph);
  } catch (error) {
    console.error("[/api/ai/knowledge-graph]", error);
    // Always return 200 with fallback so the UI renders something
    return NextResponse.json(buildFallbackGraph(movieTitle, director, cast, genres));
  }
}
