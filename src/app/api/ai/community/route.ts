// ============================================================
// POST /api/ai/community — Community AI summaries
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { communityService } from "@/ai/services/community.service";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { communityId, type = "daily" } = body;

    if (!communityId) {
      return NextResponse.json({ error: "communityId is required" }, { status: 400 });
    }

    const community = await db.community.findUnique({
      where: { id: communityId },
      include: {
        members: true,
        communityPosts: {
          include: { post: true },
          take: 20,
          orderBy: { post: { createdAt: "desc" } },
        },
      },
    });

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const recentPosts = community.communityPosts.map((cp) => cp.post.content.slice(0, 200));

    const result = await communityService.generateSummary({
      communityId,
      communityName: community.name,
      type: type as "daily" | "weekly",
      recentPosts,
      memberCount: community.members.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/community]", error);
    const message = error instanceof Error ? error.message : "Community service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
