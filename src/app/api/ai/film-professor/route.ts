// ============================================================
// POST /api/ai/film-professor — Film Professor chat
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { orchestrateStream } from "@/ai/orchestrator";
import { getFilmProfessorSystemPrompt } from "@/ai/prompts/professor.prompts";
import type { AIMessage } from "@/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic = "cinematography", level = "intermediate", messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const systemPrompt = getFilmProfessorSystemPrompt(topic, level);

    const stream = await orchestrateStream({
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages as AIMessage[]),
      ],
      temperature: 0.8,
      maxTokens: 1536,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[/api/ai/film-professor]", error);
    const message = error instanceof Error ? error.message : "Film professor error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
