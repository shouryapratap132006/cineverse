"use server";

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

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

export async function getConversations() {
  const userId = await getUserId();
  if (!userId) return { success: false, conversations: [] };

  try {
    const conversations = await db.conversation.findMany({
      where: {
        users: { some: { id: userId } }
      },
      include: {
        users: { include: { profile: true } },
        messages: {
          take: 1,
          orderBy: { sentAt: "desc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return { success: true, conversations };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMessages(conversationId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, messages: [] };

  try {
    const messages = await db.message.findMany({
      where: { conversationId },
      include: { sender: { include: { profile: true } } },
      orderBy: { sentAt: "asc" }
    });

    return { success: true, messages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        seenBy: [userId]
      },
      include: { sender: { include: { profile: true } } }
    });

    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Trigger pusher event
    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`chat-${conversationId}`, "new-message", message);
    }

    return { success: true, message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchUsers(query: string) {
  const userId = await getUserId();
  if (!userId || query.trim().length < 1) return { success: false, users: [] };

  try {
    const users = await db.user.findMany({
      where: {
        id: { not: userId },
        profile: {
          username: { contains: query, mode: "insensitive" },
        },
      },
      include: { profile: true },
      take: 10,
    });
    return { success: true, users };
  } catch (error: any) {
    return { success: false, users: [] };
  }
}

export async function getOrCreateConversation(targetUserId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { users: { some: { id: userId } } },
          { users: { some: { id: targetUserId } } }
        ]
      }
    });

    if (existing) {
      return { success: true, conversation: existing };
    }

    const conversation = await db.conversation.create({
      data: {
        isGroup: false,
        users: {
          connect: [
            { id: userId },
            { id: targetUserId }
          ]
        }
      }
    });

    return { success: true, conversation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
