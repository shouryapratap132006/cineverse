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

export async function createList(name: string, description: string, isRanked: boolean, isPublic: boolean = true) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const list = await db.cineverseList.create({
      data: { userId, name, description, isRanked, isPublic },
      include: { entries: { include: { movie: true } } },
    });
    revalidatePath("/dashboard/reviews");
    return { success: true, list };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserLists(userId?: string) {
  const currentUserId = userId ?? (await getUserId());
  if (!currentUserId) return { success: false, lists: [] };

  try {
    const lists = await db.cineverseList.findMany({
      where: { userId: currentUserId },
      include: {
        entries: {
          include: { movie: true },
          orderBy: { rank: "asc" },
          take: 5,
        },
        _count: { select: { entries: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      lists: lists.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        isRanked: l.isRanked,
        isPublic: l.isPublic,
        movieCount: l._count.entries,
        updatedAt: l.updatedAt.toISOString(),
        coverPosters: l.entries.slice(0, 4).map((e) =>
          e.movie.posterPath
            ? `https://image.tmdb.org/t/p/w342${e.movie.posterPath}`
            : null
        ),
      })),
    };
  } catch (error: any) {
    return { success: false, lists: [] };
  }
}

export async function getListDetails(listId: string) {
  try {
    const list = await db.cineverseList.findUnique({
      where: { id: listId },
      include: {
        entries: {
          include: { movie: true },
          orderBy: [{ rank: "asc" }, { addedAt: "asc" }],
        },
        user: { include: { profile: true } },
      },
    });

    if (!list) return { success: false, error: "List not found" };

    return {
      success: true,
      list: {
        id: list.id,
        name: list.name,
        description: list.description,
        isRanked: list.isRanked,
        isPublic: list.isPublic,
        owner: list.user.profile?.username || "cinephile",
        entries: list.entries.map((e) => ({
          id: e.id,
          movieId: e.movieId,
          movieTitle: e.movie.title,
          moviePoster: e.movie.posterPath
            ? `https://image.tmdb.org/t/p/w342${e.movie.posterPath}`
            : null,
          rank: e.rank,
          notes: e.notes,
        })),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMovieToList(
  listId: string,
  movieId: string,
  title: string,
  posterPath: string,
  notes?: string
) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const list = await db.cineverseList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.movie.upsert({
      where: { id: movieId },
      update: { title, posterPath },
      create: { id: movieId, title, posterPath },
    });

    // Get the current max rank for this list
    const maxRankEntry = await db.listEntry.findFirst({
      where: { listId },
      orderBy: { rank: "desc" },
    });
    const nextRank = (maxRankEntry?.rank ?? 0) + 1;

    await db.listEntry.upsert({
      where: { listId_movieId: { listId, movieId } },
      update: { notes, rank: list.isRanked ? nextRank : null },
      create: { listId, movieId, notes, rank: list.isRanked ? nextRank : null },
    });

    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeMovieFromList(listId: string, movieId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const list = await db.cineverseList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.listEntry.delete({ where: { listId_movieId: { listId, movieId } } });
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteList(listId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const list = await db.cineverseList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.cineverseList.delete({ where: { id: listId } });
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateList(listId: string, data: { name?: string; description?: string; isRanked?: boolean; isPublic?: boolean }) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const list = await db.cineverseList.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.cineverseList.update({ where: { id: listId }, data });
    revalidatePath("/dashboard/reviews");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
