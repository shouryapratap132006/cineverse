// ============================================================
// GET /api/ai/profile — Movie DNA for current user
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { tasteService } from "@/ai/services/taste.service";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Complete onboarding first." }, { status: 404 });
    }

    const watchedMovies = await db.watchlist.findMany({
      where: { userId, status: "WATCHED" },
      include: { movie: true },
      take: 30,
      orderBy: { id: "desc" },
    });

    const reviews = await db.review.findMany({
      where: { userId },
      take: 20,
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : undefined;

    const userProfile = {
      favoriteGenres: profile.favoriteGenres,
      favoriteDirectors: profile.favoriteDirectors,
      favoriteActors: profile.favoriteActors,
      favoriteMovies: profile.favoriteMovies,
      watchedMovieTitles: watchedMovies.map((w) => w.movie.title),
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : undefined,
    };

    const [dna, summary] = await Promise.all([
      tasteService.generateMovieDNA(userProfile, userId, profile.username),
      tasteService.generateProfileSummary(userProfile, profile.username),
    ]);

    return NextResponse.json({ dna, summary, profile: userProfile });
  } catch (error) {
    console.error("[/api/ai/profile]", error);
    const message = error instanceof Error ? error.message : "Profile service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
