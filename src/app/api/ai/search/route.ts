// ============================================================
// POST /api/ai/search — Semantic movie search
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { semanticSearchService } from "@/ai/services/semanticSearch.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, limit } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const result = await semanticSearchService.search({ query: query.trim(), limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/search]", error);
    const message = error instanceof Error ? error.message : "Search service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
