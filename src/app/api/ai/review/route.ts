// ============================================================
// POST /api/ai/review — Review assistant
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { reviewService } from "@/ai/services/review.service";
import type { ReviewAction } from "@/ai/types";

export const runtime = "nodejs";

const VALID_ACTIONS: ReviewAction[] = [
  "improve", "expand", "shorten", "professional", "funny",
  "spoiler_free", "grammar", "translate", "generate_title", "summarize",
];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, action, movieTitle, targetLanguage } = body;

    if (!content || !action) {
      return NextResponse.json({ error: "content and action are required" }, { status: 400 });
    }

    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Review content too long (max 10,000 characters)" }, { status: 400 });
    }

    const result = await reviewService.processReview({
      content,
      action,
      movieTitle,
      targetLanguage,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/review]", error);
    const message = error instanceof Error ? error.message : "Review service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
