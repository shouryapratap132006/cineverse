"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      return session.userId;
    } catch (e) {}
  } else {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const mockSession = cookieStore.get("cineverse_session");
    if (mockSession) {
      try {
        return JSON.parse(mockSession.value).id;
      } catch (e) {}
    }
  }
  return null;
}

export async function addDiaryEntry(data: {
  movieId: string;
  title: string;
  posterPath: string;
  watchedAt: string;
  rating?: number;
  notes?: string;
  isRewatch?: boolean;
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.movie.upsert({
      where: { id: data.movieId },
      update: { title: data.title, posterPath: data.posterPath },
      create: { id: data.movieId, title: data.title, posterPath: data.posterPath },
    });

    const entry = await db.diaryEntry.create({
      data: {
        userId,
        movieId: data.movieId,
        watchedAt: new Date(data.watchedAt),
        rating: data.rating ?? null,
        notes: data.notes ?? null,
        isRewatch: data.isRewatch ?? false,
      },
      include: { movie: true },
    });

    revalidatePath("/dashboard/reviews");
    return { success: true, entry };
  } catch (error: any) {
    console.error("Add diary entry error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserDiary(options?: { month?: number; year?: number }) {
  const userId = await getUserId();
  if (!userId) return { success: false, entries: [] };

  try {
    const where: any = { userId };

    if (options?.year) {
      const startOfYear = new Date(options.year, 0, 1);
      const endOfYear = new Date(options.year + 1, 0, 1);
      where.watchedAt = { gte: startOfYear, lt: endOfYear };

      if (options?.month !== undefined) {
        const startOfMonth = new Date(options.year, options.month, 1);
        const endOfMonth = new Date(options.year, options.month + 1, 1);
        where.watchedAt = { gte: startOfMonth, lt: endOfMonth };
      }
    }

    const entries = await db.diaryEntry.findMany({
      where,
      include: {
        movie: true,
        review: { select: { id: true, content: true } },
      },
      orderBy: { watchedAt: "desc" },
    });

    return {
      success: true,
      entries: entries.map((e) => ({
        id: e.id,
        movieId: e.movieId,
        movieTitle: e.movie.title,
        moviePoster: e.movie.posterPath
          ? `/api/tmdb/img?path=/t/p/w342${e.movie.posterPath}`
          : null,
        watchedAt: e.watchedAt.toISOString(),
        rating: e.rating,
        notes: e.notes,
        isRewatch: e.isRewatch,
        hasReview: !!e.review,
        reviewId: e.review?.id ?? null,
      })),
    };
  } catch (error: any) {
    console.error("Get diary error:", error);
    return { success: false, entries: [] };
  }
}

export async function deleteDiaryEntry(id: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const entry = await db.diaryEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId)
      return { success: false, error: "Not found or unauthorized" };

    await db.diaryEntry.delete({ where: { id } });
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDiaryEntry(
  id: string,
  data: { rating?: number; notes?: string; isRewatch?: boolean; watchedAt?: string }
) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const entry = await db.diaryEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId)
      return { success: false, error: "Not found or unauthorized" };

    await db.diaryEntry.update({
      where: { id },
      data: {
        rating: data.rating,
        notes: data.notes,
        isRewatch: data.isRewatch,
        watchedAt: data.watchedAt ? new Date(data.watchedAt) : undefined,
      },
    });
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getDiaryStats() {
  const userId = await getUserId();
  if (!userId) return { totalWatched: 0, totalRewatches: 0, avgRating: 0, thisYear: 0 };

  try {
    const thisYear = new Date().getFullYear();
    const [total, rewatches, thisYearCount, ratings] = await Promise.all([
      db.diaryEntry.count({ where: { userId } }),
      db.diaryEntry.count({ where: { userId, isRewatch: true } }),
      db.diaryEntry.count({
        where: {
          userId,
          watchedAt: { gte: new Date(thisYear, 0, 1) },
        },
      }),
      db.diaryEntry.aggregate({
        where: { userId, rating: { not: null } },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalWatched: total,
      totalRewatches: rewatches,
      avgRating: ratings._avg.rating ? Math.round(ratings._avg.rating * 10) / 10 : 0,
      thisYear: thisYearCount,
    };
  } catch {
    return { totalWatched: 0, totalRewatches: 0, avgRating: 0, thisYear: 0 };
  }
}
