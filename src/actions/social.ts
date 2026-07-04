"use server";

import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ==========================================
// FEED & POSTS
// ==========================================

export async function createPost(data: {
  content: string;
  imageUrl?: string;
  gifUrl?: string;
  movieId?: string; // TMDB movie id
  poll?: { question: string; options: string[] };
}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const postData: Prisma.PostCreateInput = {
      user: {
        connect: { id: userId }
      },
      content: data.content,
      imageUrl: data.imageUrl,
      gifUrl: data.gifUrl,
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

    const post = await db.post.create({
      data: postData
    });

    // Log Activity
    await db.activity.create({
      data: {
        userId,
        type: "POST",
        description: "Created a new post."
      }
    });

    revalidatePath("/dashboard/community");
    return { success: true, post };
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getFeed(page = 1, limit = 10) {
  try {
    const posts = await db.post.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: { profile: true }
        },
        movie: true,
        poll: {
          include: { votes: true }
        },
        _count: {
          select: { likes: true, comments: true }
        },
        likes: true, // to check if current user liked
      }
    });

    return { success: true, posts };
  } catch (error: any) {
    console.error("Get Feed Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// LIKES
// ==========================================

export async function toggleLike(postId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existingLike = await db.like.findFirst({
      where: { userId, postId }
    });

    if (existingLike) {
      await db.like.delete({ where: { id: existingLike.id } });
    } else {
      await db.like.create({
        data: { userId, postId }
      });
    }

    revalidatePath("/dashboard/community");
    return { success: true, liked: !existingLike };
  } catch (error: any) {
    console.error("Toggle Like Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// COMMENTS
// ==========================================

export async function createComment(postId: string, content: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const comment = await db.comment.create({
      data: {
        userId,
        postId,
        content
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    });

    revalidatePath(`/dashboard/community`);
    return { success: true, comment };
  } catch (error: any) {
    console.error("Create Comment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getComments(postId: string) {
  try {
    const comments = await db.comment.findMany({
      where: { postId, parentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          include: { profile: true }
        },
        _count: {
          select: { likes: true, replies: true }
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
// FOLLOW SYSTEM
// ==========================================

export async function toggleFollow(targetUserId: string) {
  const { userId } = await auth();
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
          description: `Followed user ${targetUserId}`
        }
      });
    }

    revalidatePath("/dashboard/community");
    revalidatePath(`/profile/${targetUserId}`);
    return { success: true, following: !existingFollow };
  } catch (error: any) {
    console.error("Toggle Follow Error:", error);
    return { success: false, error: error.message };
  }
}
