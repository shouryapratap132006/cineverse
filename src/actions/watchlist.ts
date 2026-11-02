"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getMovieDetails } from "@/lib/tmdb";
import { fromDbStatus, type LibraryState, type WatchlistStatus } from "@/lib/watchlist-state";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

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

/**
 * Adds, moves or removes a movie on the watchlist and returns the status it ended up with,
 * so the caller can show exactly what the database holds. Clicking the current status removes it.
 */
export async function toggleWatchlist(
  movieId: string,
  title: string,
  posterPath: string,
  status: "WANT_TO_WATCH" | "WATCHED",
): Promise<{ success: true; watchlistStatus: WatchlistStatus } | { success: false; error: string }> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // 1. Ensure the Movie exists in our local DB
    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath },
    });

    // 2. Same status again means remove; anything else is an upsert on the (userId, movieId)
    //    unique key, so a repeated or concurrent request never creates a second row.
    const existing = await db.watchlist.findUnique({
      where: { userId_movieId: { userId, movieId } },
    });

    let watchlistStatus: WatchlistStatus;
    if (existing?.status === status) {
      await db.watchlist.deleteMany({ where: { userId, movieId } });
      watchlistStatus = "none";
    } else {
      const saved = await db.watchlist.upsert({
        where: { userId_movieId: { userId, movieId } },
        update: { status },
        create: { userId, movieId, status },
      });
      watchlistStatus = fromDbStatus(saved.status);
    }

    revalidatePath("/dashboard/watchlist");
    return { success: true, watchlistStatus };
  } catch (error: unknown) {
    console.error("Watchlist toggle error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

/** Adds or removes a favorite and returns whether the movie is a favorite afterwards. */
export async function toggleFavorite(
  movieId: string,
  title: string,
  posterPath: string,
): Promise<{ success: true; isFavorite: boolean } | { success: false; error: string }> {
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
      where: { userId_movieId: { userId, movieId } },
    });

    if (existing) {
      await db.favorite.deleteMany({ where: { userId, movieId } });
    } else {
      await db.favorite.upsert({
        where: { userId_movieId: { userId, movieId } },
        update: {},
        create: { userId, movieId },
      });
    }

    revalidatePath("/dashboard/watchlist");
    return { success: true, isFavorite: !existing };
  } catch (error: unknown) {
    console.error("Favorite toggle error:", error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function removeFromAllLists(
  movieId: string,
): Promise<{ success: true } | { success: false; error: string }> {
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
  } catch (error: unknown) {
    return { success: false, error: errorMessage(error) };
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

export async function getMovieLibraryState(movieId: string): Promise<LibraryState> {
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
      watchlistStatus: fromDbStatus(wl?.status),
      isFavorite: !!fav
    };
  } catch (e) {
    return { watchlistStatus: "none", isFavorite: false };
  }
}
