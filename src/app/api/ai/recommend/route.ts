// ============================================================
// POST /api/ai/recommend — Personalized recommendations
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import type { RecommendationType } from "@/ai/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
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

        const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${aiServiceUrl}/ai/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
      },
      body: JSON.stringify({type, userProfile}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Service error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/ai/recommend]", error);
    const message = error instanceof Error ? error.message : "Recommendation service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
