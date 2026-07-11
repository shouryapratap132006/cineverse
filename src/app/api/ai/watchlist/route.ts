// ============================================================
// POST /api/ai/watchlist — AI Watchlist Builder
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { watchlistService } from "@/ai/services/watchlist.service";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, count } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json({ error: "Prompt must be at least 3 characters" }, { status: 400 });
    }

    // Optionally include user profile for personalization
    const profile = await db.profile.findUnique({ where: { id: userId } });
    const userProfile = profile
      ? {
          favoriteGenres: profile.favoriteGenres,
          favoriteDirectors: profile.favoriteDirectors,
          favoriteActors: profile.favoriteActors,
          favoriteMovies: profile.favoriteMovies,
        }
      : undefined;

    const result = await watchlistService.buildWatchlist({
      prompt: prompt.trim(),
      userProfile,
      count: Math.min(count ?? 8, 15),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/watchlist]", error);
    const message = error instanceof Error ? error.message : "Watchlist service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
