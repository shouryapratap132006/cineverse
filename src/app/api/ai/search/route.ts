// ============================================================
// POST /api/ai/search — Semantic movie search
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";


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

        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${aiServiceUrl}/ai/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({query: query.trim(), limit}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Service error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/search]", error);
    const message = error instanceof Error ? error.message : "Search service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
