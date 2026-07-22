"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMovieDetails } from "@/lib/tmdb";

// Helper to get authenticated user ID
async function getUserId() {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      return session.userId;
    } catch (e) {
      console.error("Clerk auth failed inside server action", e);
    }
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

export async function addMoviesToWatchlist(movies: { id: string; title: string; posterPath: string }[], status: "WANT_TO_WATCH" | "WATCHED") {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    for (const movie of movies) {
      await db.movie.upsert({
        where: { id: movie.id },
        update: { title: movie.title, posterPath: movie.posterPath },
        create: { id: movie.id, title: movie.title, posterPath: movie.posterPath },
      });

      await db.watchlist.upsert({
        where: {
          userId_movieId: { userId, movieId: movie.id }
        },
        update: { status },
        create: {
          userId,
          movieId: movie.id,
          status
        }
      });
    }

    revalidatePath("/dashboard/watchlist");
    return { success: true };
  } catch (error: any) {
    console.error("Batch watchlist add error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleWatchlist(movieId: string, title: string, posterPath: string, status: "WANT_TO_WATCH" | "WATCHED") {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // 1. Ensure the Movie exists in our local DB
    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath },
    });

    // 2. Check if it's already in the watchlist
    const existing = await db.watchlist.findUnique({
      where: {
        userId_movieId: { userId, movieId }
      }
    });

    if (existing) {
      if (existing.status === status) {
        // Remove it if clicking the same status
        await db.watchlist.delete({
          where: { id: existing.id }
        });
      } else {
        // Update status
        await db.watchlist.update({
          where: { id: existing.id },
          data: { status }
        });
      }
    } else {
      // Create new
      await db.watchlist.create({
        data: {
          userId,
          movieId,
          status
        }
      });
    }

    revalidatePath("/dashboard/watchlist");
    return { success: true };
  } catch (error: any) {
    console.error("Watchlist toggle error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleFavorite(movieId: string, title: string, posterPath: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Ensure movie exists
    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath },
    });

    const existing = await db.favorite.findUnique({
      where: {
        userId_movieId: { userId, movieId }
      }
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id }
      });
    } else {
      await db.favorite.create({
        data: {
          userId,
          movieId
        }
      });
    }

    revalidatePath("/dashboard/watchlist");
    return { success: true };
  } catch (error: any) {
    console.error("Favorite toggle error:", error);
    return { success: false, error: error.message };
  }
}

export async function removeFromAllLists(movieId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.watchlist.deleteMany({
      where: { userId, movieId }
    });
    await db.favorite.deleteMany({
      where: { userId, movieId }
    });
    revalidatePath("/dashboard/watchlist");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserLibrary() {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const watchlist = await db.watchlist.findMany({
      where: { userId },
      include: { movie: true }
    });

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: { movie: true }
    });

    const detailedWatchlist = await Promise.all(
      watchlist.map(async (w) => {
        try {
          const details = await getMovieDetails(w.movieId);
          return {
            id: w.movieId,
            title: details?.title || w.movie.title,
            posterUrl: details?.posterUrl || (w.movie.posterPath ? `/api/tmdb/img?path=/t/p/w500${w.movie.posterPath}` : ""),
            rating: details?.rating || 0,
            releaseYear: details?.releaseYear || 2024,
            genres: details?.genres || ["Drama"],
            status: w.status === "WANT_TO_WATCH" ? "want-to-watch" : "watched"
          };
        } catch (e) {
          return {
            id: w.movieId,
            title: w.movie.title,
            posterUrl: w.movie.posterPath ? `/api/tmdb/img?path=/t/p/w500${w.movie.posterPath}` : "",
            rating: 0,
            releaseYear: 2024,
            genres: ["Drama"],
            status: w.status === "WANT_TO_WATCH" ? "want-to-watch" : "watched"
          };
        }
      })
    );

    const detailedFavorites = await Promise.all(
      favorites.map(async (f) => {
        try {
          const details = await getMovieDetails(f.movieId);
          return {
            id: f.movieId,
            title: details?.title || f.movie.title,
            posterUrl: details?.posterUrl || (f.movie.posterPath ? `/api/tmdb/img?path=/t/p/w500${f.movie.posterPath}` : ""),
            rating: details?.rating || 0,
            releaseYear: details?.releaseYear || 2024,
            genres: details?.genres || ["Drama"],
            status: "favorite"
          };
        } catch (e) {
          return {
            id: f.movieId,
            title: f.movie.title,
            posterUrl: f.movie.posterPath ? `/api/tmdb/img?path=/t/p/w500${f.movie.posterPath}` : "",
            rating: 0,
            releaseYear: 2024,
            genres: ["Drama"],
            status: "favorite"
          };
        }
      })
    );

    return {
      success: true,
      watchlist: detailedWatchlist,
      favorites: detailedFavorites
    };
  } catch (error: any) {
    console.error("Fetch library DB error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMovieLibraryState(movieId: string) {
  const userId = await getUserId();
  if (!userId) return { watchlistStatus: "none", isFavorite: false };

  try {
    const wl = await db.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId } }
    });
    const fav = await db.favorite.findUnique({
      where: { userId_movieId: { userId, movieId } }
    });

    return {
      watchlistStatus: wl ? (wl.status === "WANT_TO_WATCH" ? "want-to-watch" : "watched") : "none",
      isFavorite: !!fav
    };
  } catch (e) {
    return { watchlistStatus: "none", isFavorite: false };
  }
}
