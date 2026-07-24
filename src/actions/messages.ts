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
  if (!userId) return { success: false, messages: [], otherUser: null };

  try {
    // Fetch messages AND the conversation participants in one query
    const [messages, conversation] = await Promise.all([
      db.message.findMany({
        where: { conversationId },
        include: { sender: { include: { profile: true } } },
        orderBy: { sentAt: "asc" }
      }),
      db.conversation.findUnique({
        where: { id: conversationId },
        include: { users: { include: { profile: true } } }
      })
    ]);

    // Find the other participant (not the current user)
    const otherUser = conversation?.users?.find((u: any) => u.id !== userId) ?? null;

    return { success: true, messages, otherUser };
  } catch (error: any) {
    return { success: false, error: error.message, otherUser: null };
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

export async function editMessage(messageId: string, newContent: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!existing) return { success: false, error: "Message not found" };
    if (existing.senderId !== userId) return { success: false, error: "Unauthorized to edit this message" };

    const updated = await db.message.update({
      where: { id: messageId },
      data: { content: newContent },
      include: { sender: { include: { profile: true } } }
    });

    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`chat-${updated.conversationId}`, "edit-message", updated);
    }

    return { success: true, message: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMessage(messageId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!existing) return { success: false, error: "Message not found" };
    if (existing.senderId !== userId) return { success: false, error: "Unauthorized to delete this message" };

    await db.message.delete({
      where: { id: messageId }
    });

    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`chat-${existing.conversationId}`, "delete-message", { messageId });
    }

    return { success: true, messageId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function togglePinMessage(messageId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const existing = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!existing) return { success: false, error: "Message not found" };

    const updated = await db.message.update({
      where: { id: messageId },
      data: { pinned: !existing.pinned },
      include: { sender: { include: { profile: true } } }
    });

    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`chat-${updated.conversationId}`, "pin-message", updated);
    }

    return { success: true, message: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsSeen(conversationId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const unreadMessages = await db.message.findMany({
      where: {
        conversationId,
        NOT: { seenBy: { has: userId } },
      },
      select: { id: true, seenBy: true },
    });

    if (unreadMessages.length === 0) return { success: true };

    await Promise.all(
      unreadMessages.map((msg) =>
        db.message.update({
          where: { id: msg.id },
          data: {
            seenBy: { push: userId },
          },
        })
      )
    );

    if (process.env.PUSHER_APP_ID) {
      await pusherServer.trigger(`chat-${conversationId}`, "messages-seen", { userId, conversationId });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
