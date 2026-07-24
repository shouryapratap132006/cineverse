// ============================================================
// POST /api/ai/recommend — Personalized recommendations
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";

import { db } from "@/lib/db";
import type { RecommendationType } from "@/ai/types";
import { recommendationService } from "@/ai/services/recommendation.service";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type = "hidden_gems" } = body as { type?: RecommendationType };

    // Fetch user's taste profile from the database
    const profile = await db.profile.findUnique({
      where: { id: userId },
    });

    const watchedMovies = await db.watchlist.findMany({
      where: { userId, status: "WATCHED" },
      include: { movie: true },
      take: 20,
      orderBy: { id: "desc" },
    });

    const userProfile = {
      favoriteGenres: profile?.favoriteGenres ?? [],
      favoriteDirectors: profile?.favoriteDirectors ?? [],
      favoriteActors: profile?.favoriteActors ?? [],
      favoriteMovies: profile?.favoriteMovies ?? [],
      watchedMovieTitles: watchedMovies.map((w) => w.movie.title),
    };

    // Generate recommendations in-process via Groq (the previous external AI
    // microservice at AI_SERVICE_URL is not deployed, so this route used to 500).
    const result = await recommendationService.getRecommendations({
      userId,
      type,
      userProfile,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/recommend]", error);
    const message = error instanceof Error ? error.message : "Recommendation service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
