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

export async function createReview(movieId: string, title: string, posterPath: string, rating: number, content: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Ensure movie exists in local DB
    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath }
    });

    const review = await db.review.create({
      data: {
        userId,
        movieId,
        rating,
        content
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    revalidatePath(`/dashboard/movies/${movieId}`);
    return { success: true, review };
  } catch (error: any) {
    console.error("Create review DB error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMovieReviews(movieId: string) {
  try {
    const reviews = await db.review.findMany({
      where: { movieId },
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        user: r.user.profile?.username || "cinephile",
        rating: r.rating,
        content: r.content,
        date: new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        avatarUrl: r.user.profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      }))
    };
  } catch (error: any) {
    console.error("Get reviews DB error:", error);
    return { success: false, error: error.message, reviews: [] };
  }
}
