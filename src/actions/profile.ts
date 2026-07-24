"use server";

import { db } from "@/lib/db";

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

export async function getUserProfile(targetId?: string) {
  const currentUserId = await getUserId();
  const idToFetch = targetId || currentUserId;
  
  if (!idToFetch) return { success: false, error: "Unauthorized" };

  try {
    const user = await db.user.findUnique({
      where: { id: idToFetch },
      include: {
        profile: true,
        _count: {
          select: {
            followers: true,
            following: true,
            reviews: true,
            lists: true,
            posts: true
          }
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { movie: true }
        },
        activities: {
          take: 10,
          orderBy: { createdAt: "desc" }
        },
        // Liked posts (reactions user made on posts)
        reactions: {
          where: { postId: { not: null } },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              include: {
                user: { include: { profile: true } },
                movie: true,
                _count: { select: { reactions: true, comments: true } }
              }
            }
          }
        },
        // Comments user made
        comments: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              include: {
                user: { include: { profile: true } },
                _count: { select: { reactions: true, comments: true } }
              }
            }
          }
        },
        // Bookmarked posts
        bookmarks: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            post: {
              include: {
                user: { include: { profile: true } },
                movie: true,
                _count: { select: { reactions: true, comments: true } }
              }
            }
          }
        },
        // Recent diary entries (watched movies)
        diaryEntries: {
          take: 20,
          orderBy: { watchedAt: "desc" },
          include: { movie: true }
        },
        // Favorited movies
        favorites: {
          include: { movie: true }
        }
      }
    });

    if (!user) return { success: false, error: "User not found" };

    // Connection status if viewing someone else
    let connection = {
      isFollowing: false,
      isFriend: false,
      friendRequestSent: false,
      friendRequestReceived: false
    };

    if (currentUserId && targetId && currentUserId !== targetId) {
      const follow = await db.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: targetId } }
      });
      connection.isFollowing = !!follow;

      const friendReq = await db.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: targetId },
            { senderId: targetId, receiverId: currentUserId }
          ]
        }
      });

      if (friendReq) {
        if (friendReq.status === "ACCEPTED") connection.isFriend = true;
        else if (friendReq.status === "PENDING" && friendReq.senderId === currentUserId) connection.friendRequestSent = true;
        else if (friendReq.status === "PENDING" && friendReq.receiverId === currentUserId) {
          connection.friendRequestReceived = true;
          (connection as any).requestId = friendReq.id;
        }
      }
    }

    return { success: true, user, connection, isSelf: idToFetch === currentUserId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await db.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        movie: true,
        _count: { select: { reactions: true, comments: true } },
      }
    });
    return { success: true, posts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSuggestedUsers() {
  const currentUserId = await getUserId();

  try {
    const following = await db.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true }
    });
    
    const excludedIds = [currentUserId, ...following.map(f => f.followingId)];

    const suggested = await db.user.findMany({
      where: { id: { notIn: excludedIds } },
      take: 5,
      include: { profile: true, _count: { select: { followers: true } } },
      orderBy: { followers: { _count: 'desc' } }
    });

    return { success: true, users: suggested };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
