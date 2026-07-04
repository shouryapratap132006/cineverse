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

export async function sendFriendRequest(targetUserId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };
  if (userId === targetUserId) return { success: false, error: "Cannot add yourself" };

  try {
    const existing = await db.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    if (existing) {
      if (existing.status === "PENDING") return { success: false, error: "Request already pending" };
      if (existing.status === "ACCEPTED") return { success: false, error: "Already friends" };
    }

    const request = await db.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: targetUserId,
      },
    });

    // Notify receiver
    await db.notification.create({
      data: {
        receiverId: targetUserId,
        actorId: userId,
        type: "FRIEND_REQUEST",
        targetId: request.id,
      },
    });

    revalidatePath(`/dashboard/profile/${targetUserId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function acceptFriendRequest(requestId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const request = await db.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== userId) {
      return { success: false, error: "Request not found" };
    }

    await db.friendRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    // Reciprocal Follow (if not already following)
    const followConfigs = [
      { followerId: request.senderId, followingId: request.receiverId },
      { followerId: request.receiverId, followingId: request.senderId },
    ];

    for (const conf of followConfigs) {
      await db.follow.upsert({
        where: { followerId_followingId: conf },
        update: {},
        create: conf,
      });
    }

    // Notify sender that it was accepted
    await db.notification.create({
      data: {
        receiverId: request.senderId,
        actorId: userId,
        type: "ACCEPTED",
        targetId: request.id,
      },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectFriendRequest(requestId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const request = await db.friendRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== userId) {
      return { success: false, error: "Request not found" };
    }

    await db.friendRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFriend(targetUserId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const request = await db.friendRequest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    if (request) {
      await db.friendRequest.delete({ where: { id: request.id } });
    }

    revalidatePath(`/dashboard/profile/${targetUserId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
