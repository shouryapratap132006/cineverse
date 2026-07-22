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

export async function createReview(
  movieId: string,
  title: string,
  posterPath: string,
  rating: number,
  content: string,
  options?: {
    containsSpoilers?: boolean;
    isRewatch?: boolean;
    watchedAt?: string;
    visibility?: string;
    addToDiary?: boolean;
  }
) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath },
    });

    const watchedAt = options?.watchedAt ? new Date(options.watchedAt) : new Date();

    const review = await db.review.create({
      data: {
        userId,
        movieId,
        rating,
        content,
        containsSpoilers: options?.containsSpoilers ?? false,
        isRewatch: options?.isRewatch ?? false,
        visibility: options?.visibility ?? "PUBLIC",
        watchedAt,
      },
      include: {
        user: { include: { profile: true } },
        movie: true,
        likes: true,
      },
    });

    // Optionally create a diary entry linked to this review
    if (options?.addToDiary) {
      await db.diaryEntry.create({
        data: {
          userId,
          movieId,
          reviewId: review.id,
          watchedAt,
          rating,
          isRewatch: options?.isRewatch ?? false,
        },
      });
    }

    revalidatePath(`/dashboard/movies/${movieId}`);
    revalidatePath("/dashboard/reviews");
    return { success: true, review };
  } catch (error: any) {
    console.error("Create review DB error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserReviews(userId?: string) {
  const currentUserId = userId ?? (await getUserId());
  if (!currentUserId) return { success: false, reviews: [] };

  try {
    const reviews = await db.review.findMany({
      where: { userId: currentUserId },
      include: {
        movie: true,
        likes: true,
        comments: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        movieId: r.movieId,
        movieTitle: r.movie.title,
        moviePoster: r.movie.posterPath
          ? `/api/tmdb/img?path=/t/p/w342${r.movie.posterPath}`
          : null,
        rating: r.rating,
        content: r.content,
        containsSpoilers: r.containsSpoilers,
        isRewatch: r.isRewatch,
        visibility: r.visibility,
        watchedAt: r.watchedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        likeCount: r._count.likes,
        commentCount: r._count.comments,
      })),
    };
  } catch (error: any) {
    console.error("Get user reviews DB error:", error);
    return { success: false, reviews: [] };
  }
}

export async function getMovieReviews(movieId: string) {
  try {
    const reviews = await db.review.findMany({
      where: { movieId, visibility: "PUBLIC" },
      include: {
        user: { include: { profile: true } },
        likes: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        user: r.user.profile?.username || "cinephile",
        rating: r.rating,
        content: r.content,
        containsSpoilers: r.containsSpoilers,
        isRewatch: r.isRewatch,
        date: new Date(r.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        avatarUrl:
          r.user.profile?.avatarUrl ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        likeCount: r._count.likes,
        commentCount: r._count.comments,
      })),
    };
  } catch (error: any) {
    console.error("Get reviews DB error:", error);
    return { success: false, error: error.message, reviews: [] };
  }
}

export async function deleteReview(reviewId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const review = await db.review.findUnique({ where: { id: reviewId } });
    if (!review || review.userId !== userId)
      return { success: false, error: "Not found or unauthorized" };

    await db.review.delete({ where: { id: reviewId } });
    revalidatePath("/dashboard/reviews");
    revalidatePath(`/dashboard/movies/${review.movieId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function likeReview(reviewId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.like.findFirst({
      where: { userId, reviewId },
    });

    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
      return { success: true, liked: false };
    } else {
      await db.like.create({ data: { userId, reviewId } });
      return { success: true, liked: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchMoviesForReview(query: string) {
  if (!query || query.trim().length < 2) return { results: [] };
  const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!TMDB_API_KEY) return { results: [] };

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    if (!res.ok) return { results: [] };
    const data = await res.json();
    return {
      results: (data.results || []).slice(0, 8).map((m: any) => ({
        id: String(m.id),
        title: m.title,
        posterPath: m.poster_path || null,
        releaseYear: m.release_date
          ? new Date(m.release_date).getFullYear()
          : null,
        overview: m.overview || "",
      })),
    };
  } catch {
    return { results: [] };
  }
}
