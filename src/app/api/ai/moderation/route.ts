// ============================================================
// POST /api/ai/moderation — Smart content moderation
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { moderationService } from "@/ai/services/moderation.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, type = "post", context } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const result = await moderationService.moderate({ content, type, context });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/moderation]", error);
    const message = error instanceof Error ? error.message : "Moderation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
