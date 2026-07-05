"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Custom helper for getUserId
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

// ==========================================
// FEED & POSTS
// ==========================================

export async function createPost(data: {
  content: string;
  type?: string;
  imageUrl?: string;
  gifUrl?: string;
  movieId?: string;
  spoilerTag?: boolean;
  poll?: { question: string; options: string[] };
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    // Extract hashtags from content
    const hashtags = Array.from(new Set(data.content.match(/#[a-zA-Z0-9_]+/g) || [])).map(tag => tag.toLowerCase());
    
    // Extract mentions from content
    const mentionTags = Array.from(new Set(data.content.match(/@[a-zA-Z0-9_]+/g) || []));
    let mentions: string[] = [];
    
    // Find user IDs for mentions
    if (mentionTags.length > 0) {
      const usernames = mentionTags.map(m => m.substring(1));
      const users = await db.profile.findMany({
        where: { username: { in: usernames } },
        select: { id: true }
      });
      mentions = users.map(u => u.id);
    }

    const postData: Prisma.PostCreateInput = {
      user: { connect: { id: userId } },
      content: data.content,
      type: data.type || "TEXT",
      imageUrl: data.imageUrl,
      gifUrl: data.gifUrl,
      spoilerTag: data.spoilerTag || false,
      hashtags,
      mentions,
      ...(data.movieId ? {
        movie: {
          connectOrCreate: {
            where: { id: data.movieId },
            create: { id: data.movieId, title: "Tagged Movie" }
          }
        }
      } : {}),
      ...(data.poll ? {
        poll: {
          create: {
            question: data.poll.question,
            options: data.poll.options
          }
        }
      } : {})
    };

    const post = await db.post.create({ data: postData });

    // Notify mentioned users
    for (const mentionId of mentions) {
      await db.notification.create({
        data: {
          receiverId: mentionId,
          actorId: userId,
          type: "MENTION",
          targetId: post.id,
          link: `/dashboard/post/${post.id}`
        }
      });
    }

    // Log Activity
    await db.activity.create({
      data: {
        userId,
        type: "POST",
        description: "Created a new post."
      }
    });

    revalidatePath("/dashboard");
    return { success: true, post };
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getFeed(page = 1, limit = 15) {
  const userId = await getUserId();
  
  try {
    const posts = await db.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { include: { profile: true } },
        movie: true,
        poll: { include: { votes: true } },
        _count: { select: { reactions: true, comments: true } },
        reactions: userId ? { where: { userId } } : false,
        bookmarks: userId ? { where: { userId } } : false,
      }
    });

    return { success: true, posts };
  } catch (error: any) {
    console.error("Get Feed Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getPost(postId: string) {
  const userId = await getUserId();
  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        user: { include: { profile: true } },
        movie: true,
        poll: { include: { votes: true } },
        _count: { select: { reactions: true, comments: true } },
        reactions: userId ? { where: { userId } } : false,
        bookmarks: userId ? { where: { userId } } : false,
      }
    });
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// REACTIONS
// ==========================================

export async function toggleReaction(targetId: string, type: "POST" | "COMMENT" | "REVIEW", emoji: string = "LIKE") {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const whereClause = type === "POST" ? { postId: targetId } 
                      : type === "COMMENT" ? { commentId: targetId } 
                      : { reviewId: targetId };

    const existingReaction = await db.reaction.findFirst({
      where: { userId, ...whereClause }
    });

    let action = "removed";

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Toggle off
        await db.reaction.delete({ where: { id: existingReaction.id } });
      } else {
        // Change reaction
        await db.reaction.update({
          where: { id: existingReaction.id },
          data: { emoji }
        });
        action = "changed";
      }
    } else {
      // Create new
      await db.reaction.create({
        data: { userId, ...whereClause, emoji }
      });
      action = "added";
      
      // Send notification if not own post
      let receiverId = null;
      if (type === "POST") {
        const p = await db.post.findUnique({ where: { id: targetId }, select: { userId: true } });
        receiverId = p?.userId;
      } else if (type === "COMMENT") {
        const c = await db.comment.findUnique({ where: { id: targetId }, select: { userId: true } });
        receiverId = c?.userId;
      } else if (type === "REVIEW") {
        const r = await db.review.findUnique({ where: { id: targetId }, select: { userId: true } });
        receiverId = r?.userId;
      }
      
      if (receiverId && receiverId !== userId) {
        await db.notification.create({
          data: {
            receiverId,
            actorId: userId,
            type: "LIKE",
            targetId,
            link: type === "POST" ? `/dashboard/post/${targetId}` : null
          }
        });
      }
    }

    revalidatePath("/dashboard");
    return { success: true, action, emoji };
  } catch (error: any) {
    console.error("Toggle Reaction Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// COMMENTS
// ==========================================

export async function voteOnPoll(pollId: string, optionIndex: number) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existingVote = await db.vote.findUnique({
      where: { pollId_userId: { pollId, userId } },
    });

    if (existingVote) {
      return { success: false, error: "You have already voted" };
    }

    const vote = await db.vote.create({
      data: { pollId, userId, optionIndex },
    });

    revalidatePath("/dashboard");
    return { success: true, vote };
  } catch (error: any) {
    console.error("Vote Poll Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createComment(data: {
  postId?: string;
  reviewId?: string;
  parentId?: string;
  content: string;
}) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const comment = await db.comment.create({
      data: {
        userId,
        postId: data.postId,
        reviewId: data.reviewId,
        parentId: data.parentId,
        content: data.content
      },
      include: {
        user: { include: { profile: true } }
      }
    });

    // Notify post/review/parent author
    let receiverId = null;
    let notifyType = "COMMENT";
    if (data.parentId) {
      const p = await db.comment.findUnique({ where: { id: data.parentId }, select: { userId: true } });
      receiverId = p?.userId;
      notifyType = "REPLY";
    } else if (data.postId) {
      const p = await db.post.findUnique({ where: { id: data.postId }, select: { userId: true } });
      receiverId = p?.userId;
    } else if (data.reviewId) {
      const r = await db.review.findUnique({ where: { id: data.reviewId }, select: { userId: true } });
      receiverId = r?.userId;
    }

    if (receiverId && receiverId !== userId) {
      await db.notification.create({
        data: {
          receiverId,
          actorId: userId,
          type: notifyType,
          targetId: comment.id,
          link: data.postId ? `/dashboard/post/${data.postId}` : null
        }
      });
    }

    revalidatePath(`/dashboard`);
    return { success: true, comment };
  } catch (error: any) {
    console.error("Create Comment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getComments(targetId: string, type: "POST" | "REVIEW") {
  const userId = await getUserId();
  try {
    const whereClause = type === "POST" ? { postId: targetId } : { reviewId: targetId };
    
    // Fetch all comments and organize them into a tree structure client-side, 
    // or fetch top level and their immediate children
    const comments = await db.comment.findMany({
      where: { ...whereClause, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: { include: { profile: true } },
        _count: { select: { reactions: true, replies: true } },
        reactions: userId ? { where: { userId } } : false,
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { include: { profile: true } },
            _count: { select: { reactions: true } },
            reactions: userId ? { where: { userId } } : false,
          }
        }
      }
    });

    return { success: true, comments };
  } catch (error: any) {
    console.error("Get Comments Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// BOOKMARKS
// ==========================================

export async function toggleBookmark(targetId: string, type: "POST" | "REVIEW") {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const whereClause = type === "POST" ? { postId: targetId } : { reviewId: targetId };
    
    const existing = await db.bookmark.findFirst({
      where: { userId, ...whereClause }
    });

    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return { success: true, bookmarked: false };
    } else {
      await db.bookmark.create({
        data: { userId, ...whereClause }
      });
      return { success: true, bookmarked: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// FOLLOW SYSTEM
// ==========================================

export async function toggleFollow(targetUserId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };
  if (userId === targetUserId) return { success: false, error: "Cannot follow yourself" };

  try {
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      await db.follow.delete({ where: { id: existingFollow.id } });
    } else {
      await db.follow.create({
        data: {
          followerId: userId,
          followingId: targetUserId
        }
      });

      // Log Activity
      await db.activity.create({
        data: {
          userId,
          type: "FOLLOW",
          description: `Followed a new user`
        }
      });
      
      // Notify
      await db.notification.create({
        data: {
          receiverId: targetUserId,
          actorId: userId,
          type: "FOLLOW",
          link: `/dashboard/profile/${userId}`
        }
      });
    }

    revalidatePath("/dashboard/profile");
    return { success: true, following: !existingFollow };
  } catch (error: any) {
    console.error("Toggle Follow Error:", error);
    return { success: false, error: error.message };
  }
}
