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

export async function createCommunity(data: {
  name: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  type?: string;
  tmdbId?: string;
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const community = await db.community.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        type: data.type || "USER_CREATED",
        tmdbId: data.tmdbId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    revalidatePath("/dashboard/community");
    return { success: true, community };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCommunities(filter: "all" | "joined" | "popular" = "all") {
  const userId = await getUserId();

  try {
    let communities;

    if (filter === "joined" && userId) {
      communities = await db.community.findMany({
        where: { members: { some: { userId } } },
        include: {
          _count: { select: { members: true, communityPosts: true } },
          members: userId ? { where: { userId }, take: 1 } : false,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (filter === "popular") {
      communities = await db.community.findMany({
        include: {
          _count: { select: { members: true, communityPosts: true } },
          members: userId ? { where: { userId }, take: 1 } : false,
        },
        orderBy: { members: { _count: "desc" } },
        take: 20,
      });
    } else {
      communities = await db.community.findMany({
        include: {
          _count: { select: { members: true, communityPosts: true } },
          members: userId ? { where: { userId }, take: 1 } : false,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return { success: true, communities };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function joinCommunity(communityId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Check if already a member
    const existing = await db.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (existing) return { success: false, error: "Already a member" };

    const member = await db.communityMember.create({
      data: { communityId, userId, role: "MEMBER" },
    });

    revalidatePath(`/dashboard/community`);
    return { success: true, member };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function leaveCommunity(communityId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.communityMember.delete({
      where: { communityId_userId: { communityId, userId } },
    });
    revalidatePath(`/dashboard/community`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCommunity(slug: string) {
  const userId = await getUserId();
  try {
    const community = await db.community.findUnique({
      where: { slug },
      include: {
        members: {
          take: 12,
          include: { user: { include: { profile: true } } },
        },
        _count: { select: { members: true, communityPosts: true } },
        communityPosts: {
          take: 20,
          orderBy: {
            post: {
              createdAt: "desc",
            },
          },
          include: {
            post: {
              include: {
                user: { include: { profile: true } },
                _count: { select: { reactions: true, comments: true } },
              },
            },
          },
        },
      },
    });

    const isMember = userId
      ? !!(await db.communityMember.findUnique({
          where: { communityId_userId: { communityId: community?.id || "", userId } },
        }))
      : false;

    const userRole = userId
      ? (await db.communityMember.findUnique({
          where: { communityId_userId: { communityId: community?.id || "", userId } },
        }))?.role || null
      : null;

    return { success: true, community, isMember, userRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCommunityPost(communityId: string, content: string, imageUrl?: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const post = await db.post.create({
      data: {
        userId,
        content,
        imageUrl,
        type: "TEXT",
      },
      include: {
        user: { include: { profile: true } },
        _count: { select: { reactions: true, comments: true } },
      },
    });

    await db.communityPost.create({
      data: {
        communityId,
        postId: post.id,
      },
    });

    revalidatePath(`/dashboard/community`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// EVENTS
// ==========================================

export async function createEvent(data: {
  communityId: string;
  title: string;
  description: string;
  eventDate: Date;
  movieId?: string;
  movieTitle?: string;
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const event = await db.event.create({
      data: {
        communityId: data.communityId,
        creatorId: userId,
        title: data.title,
        description: data.description,
        date: data.eventDate,
        movieId: data.movieId,
        movieTitle: data.movieTitle,
      },
    });

    revalidatePath(`/dashboard/community`);
    return { success: true, event };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUpcomingEvents(communityId?: string) {
  try {
    const events = await db.event.findMany({
      where: {
        date: { gte: new Date() },
        ...(communityId ? { communityId } : {}),
      },
      orderBy: { date: "asc" },
      take: 10,
      include: {
        community: { select: { name: true, slug: true } },
        creator: { include: { profile: true } },
        _count: { select: { rsvps: true } },
      },
    });
    return { success: true, events };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rsvpEvent(eventId: string, status: "GOING" | "INTERESTED" | "NOT_GOING") {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.eventRSVP.upsert({
      where: { eventId_userId: { eventId, userId } },
      update: { status },
      create: { eventId, userId, status },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// FILM CLUBS
// ==========================================

export async function createFilmClub(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const club = await db.filmClub.create({
      data: {
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? true,
        ownerId: userId,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
    });
    return { success: true, club };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFilmClubs() {
  const userId = await getUserId();
  try {
    const clubs = await db.filmClub.findMany({
      where: { isPublic: true },
      include: {
        owner: { include: { profile: true } },
        _count: { select: { members: true, watchlist: true } },
        members: userId ? { where: { userId }, take: 1 } : false,
        watchlist: { take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, clubs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function joinFilmClub(clubId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.filmClubMember.create({
      data: { clubId, userId, role: "MEMBER" },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addMovieToClub(clubId: string, movie: { tmdbId: string; title: string; posterPath?: string }) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.filmClubMovie.upsert({
      where: { clubId_tmdbId: { clubId, tmdbId: movie.tmdbId } },
      update: {},
      create: { clubId, tmdbId: movie.tmdbId, title: movie.title, posterPath: movie.posterPath, addedById: userId },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
