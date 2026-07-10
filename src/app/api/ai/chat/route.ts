// ============================================================
// POST /api/ai/chat — Streaming movie companion
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { movieAssistantService } from "@/ai/services/movieAssistant.service";
import type { AIMessage } from "@/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { movieId, movieTitle, movieOverview, genres, director, year, messages } = body;

    if (!movieTitle || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const stream = await movieAssistantService.streamResponse({
      movieId: movieId ?? "",
      movieTitle,
      movieOverview,
      genres,
      director,
      year,
      messages: messages as AIMessage[],
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
    console.error("[/api/ai/chat]", error);
    const message = error instanceof Error ? error.message : "AI service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Get suggested prompts
export async function GET() {
  const prompts = movieAssistantService.getSuggestedPrompts();
  return NextResponse.json({ prompts });
}
