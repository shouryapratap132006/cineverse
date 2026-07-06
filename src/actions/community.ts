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

export async function seedFeaturedCommunities() {
  const FEATURED = [
    {
      name: "Sci-Fi Enthusiasts",
      slug: "sci-fi-enthusiasts",
      description: "Explore the cosmos through cinema. Hard sci-fi, space opera, cyberpunk — all welcome.",
      type: "GENRE",
      bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200",
    },
    {
      name: "Nolanverse",
      slug: "nolanverse",
      description: "For those who believe Christopher Nolan hasn't made a bad film. Mind-bending discussions.",
      type: "DIRECTOR",
      bannerUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200",
    },
    {
      name: "A24 Fanatics",
      slug: "a24-fanatics",
      description: "Prestige cinema meets cult obsession. Midsommar to Everything Everywhere.",
      type: "STUDIO",
      bannerUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200",
    },
    {
      name: "Bollywood Blockbusters",
      slug: "bollywood-blockbusters",
      description: "RRR, KGF, Baahubali and beyond. Celebrating the grandeur of Indian cinema.",
      type: "GENRE",
      bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    },
    {
      name: "Horror Freaks",
      slug: "horror-freaks",
      description: "From Ari Aster to James Wan. We love being scared. No jump scare slander.",
      type: "GENRE",
      bannerUrl: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1200",
    },
  ];

  try {
    for (const c of FEATURED) {
      await db.community.upsert({
        where: { slug: c.slug },
        update: {},
        create: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          type: c.type,
          bannerUrl: c.bannerUrl,
          rules: [],
          events: [],
        },
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function createCommunity(data: {
  name: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  avatarUrl?: string;
  type?: string;
  tmdbId?: string;
  rules?: string[];
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
        bannerUrl: data.bannerUrl,
        avatarUrl: data.avatarUrl,
        rules: data.rules || [],
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
          take: 20,
          orderBy: { joinedAt: "asc" },
          include: { user: { include: { profile: true } } },
        },
        _count: { select: { members: true, communityPosts: true, communityEvents: true } },
        communityPosts: {
          take: 20,
          orderBy: {
            post: { createdAt: "desc" },
          },
          include: {
            post: {
              include: {
                user: { include: { profile: true } },
                _count: { select: { reactions: true, comments: true } },
                reactions: { take: 1 },
                bookmarks: { take: 1 },
                poll: { include: { votes: true } },
                movie: true,
              },
            },
          },
        },
      },
    });

    if (!community) return { success: false, error: "Community not found" };

    const memberRecord = userId
      ? await db.communityMember.findUnique({
          where: { communityId_userId: { communityId: community.id, userId } },
        })
      : null;

    const isMember = !!memberRecord;
    const userRole = memberRecord?.role || null;

    return { success: true, community, isMember, userRole };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCommunityMembers(
  communityId: string,
  sort: "newest" | "oldest" | "role" = "newest"
) {
  try {
    const orderBy =
      sort === "oldest"
        ? { joinedAt: "asc" as const }
        : sort === "role"
        ? { role: "asc" as const }
        : { joinedAt: "desc" as const };

    const members = await db.communityMember.findMany({
      where: { communityId },
      orderBy,
      include: {
        user: {
          include: {
            profile: true,
            _count: { select: { posts: true, reviews: true, followers: true } },
          },
        },
      },
    });

    return { success: true, members };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCommunityLeaderboard(communityId: string) {
  try {
    // Get members ordered by number of community posts
    const members = await db.communityMember.findMany({
      where: { communityId },
      include: {
        user: {
          include: {
            profile: true,
            _count: { select: { posts: true, reviews: true } },
          },
        },
      },
      take: 10,
    });

    // Sort by post count descending
    const sorted = members.sort(
      (a, b) => (b.user._count?.posts || 0) - (a.user._count?.posts || 0)
    );

    return { success: true, leaderboard: sorted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCommunityReviews(communityId: string) {
  try {
    // Get reviews from community members
    const community = await db.community.findUnique({
      where: { id: communityId },
      include: {
        members: {
          select: { userId: true },
        },
      },
    });

    if (!community) return { success: false, reviews: [] };

    const memberIds = community.members.map((m) => m.userId);

    const reviews = await db.review.findMany({
      where: {
        userId: { in: memberIds },
        visibility: "PUBLIC",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { include: { profile: true } },
        movie: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    return { success: true, reviews };
  } catch (error: any) {
    return { success: false, reviews: [] };
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
      data: { communityId, postId: post.id },
    });

    // Log activity
    await db.activity.create({
      data: {
        userId,
        type: "POST",
        description: "Posted in a community.",
      },
    });

    revalidatePath(`/dashboard/community`);
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function pinCommunityPost(communityId: string, postId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Verify user is mod/owner
    const member = await db.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!member || !["OWNER", "ADMIN", "MODERATOR"].includes(member.role)) {
      return { success: false, error: "Not authorized" };
    }

    await db.communityPost.update({
      where: { communityId_postId: { communityId, postId } },
      data: { isPinned: true },
    });

    revalidatePath(`/dashboard/community`);
    return { success: true };
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
        community: { select: { name: true, slug: true, avatarUrl: true } },
        creator: { include: { profile: true } },
        _count: { select: { rsvps: true } },
        rsvps: { take: 5, include: { user: { include: { profile: true } } } },
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
