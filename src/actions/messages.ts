"use server";

import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

/**
 * Ensures user and profile exist in PostgreSQL database before executing message/conversation queries.
 */
async function ensureUserExists(userId: string) {
  if (!userId) return null;
  try {
    let user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      let email = `${userId}@cineverse.app`;
      let username = `cinephile_${userId.slice(-4)}`;

      const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (hasClerkKey) {
        try {
          const { currentUser } = await import("@clerk/nextjs/server");
          const clerkUser = await currentUser();
          if (clerkUser && clerkUser.id === userId) {
            email = clerkUser.emailAddresses[0]?.emailAddress || email;
            username = clerkUser.username || email.split("@")[0] || username;
          }
        } catch (e) {
          console.warn("[ensureUserExists] Clerk fetch warning:", e);
        }
      }

      const existingProfile = await db.profile.findUnique({ where: { username } });
      if (existingProfile) {
        username = `${username}_${Math.floor(Math.random() * 1000)}`;
      }

      user = await db.user.create({
        data: {
          id: userId,
          email,
          profile: {
            create: {
              username,
              bio: "Cinephile reviewing the classics.",
              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
              bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
              favoriteGenres: [],
              favoriteMovies: [],
              favoriteActors: [],
              favoriteDirectors: [],
            },
          },
        },
        include: { profile: true },
      });
    }
    return user;
  } catch (e) {
    console.error("[ensureUserExists] Error ensuring user:", e);
    return null;
  }
}

export async function getConversations() {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, conversations: [] };

  try {
    await ensureUserExists(userId);

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
    console.error("[getConversations] Error:", error);
    return { success: false, error: error.message, conversations: [] };
  }
}

export async function getMessages(conversationId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, messages: [], otherUser: null };

  try {
    await ensureUserExists(userId);

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

    const otherUser = conversation?.users?.find((u: any) => u.id !== userId) ?? null;

    return { success: true, messages, otherUser };
  } catch (error: any) {
    console.error("[getMessages] Error:", error);
    return { success: false, error: error.message, messages: [], otherUser: null };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await ensureUserExists(userId);

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

    if (process.env.PUSHER_APP_ID) {
      try {
        await pusherServer.trigger(`chat-${conversationId}`, "new-message", message);
      } catch (pusherErr) {
        console.warn("[sendMessage] Pusher trigger warning (message saved successfully):", pusherErr);
      }
    }

    return { success: true, message };
  } catch (error: any) {
    console.error("[sendMessage] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function searchUsers(query: string) {
  const userId = await getAuthUserId();
  if (!userId || query.trim().length < 1) return { success: false, users: [] };

  try {
    await ensureUserExists(userId);

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
    console.error("[searchUsers] Error:", error);
    return { success: false, users: [] };
  }
}

export async function getOrCreateConversation(targetUserId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await Promise.all([
      ensureUserExists(userId),
      ensureUserExists(targetUserId),
    ]);

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
    console.error("[getOrCreateConversation] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function editMessage(messageId: string, newContent: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await ensureUserExists(userId);

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
      try {
        await pusherServer.trigger(`chat-${updated.conversationId}`, "edit-message", updated);
      } catch (pusherErr) {
        console.warn("[editMessage] Pusher warning:", pusherErr);
      }
    }

    return { success: true, message: updated };
  } catch (error: any) {
    console.error("[editMessage] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMessage(messageId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await ensureUserExists(userId);

    const existing = await db.message.findUnique({
      where: { id: messageId }
    });

    if (!existing) return { success: false, error: "Message not found" };
    if (existing.senderId !== userId) return { success: false, error: "Unauthorized to delete this message" };

    await db.message.delete({
      where: { id: messageId }
    });

    if (process.env.PUSHER_APP_ID) {
      try {
        await pusherServer.trigger(`chat-${existing.conversationId}`, "delete-message", { messageId });
      } catch (pusherErr) {
        console.warn("[deleteMessage] Pusher warning:", pusherErr);
      }
    }

    return { success: true, messageId };
  } catch (error: any) {
    console.error("[deleteMessage] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePinMessage(messageId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await ensureUserExists(userId);

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
      try {
        await pusherServer.trigger(`chat-${updated.conversationId}`, "pin-message", updated);
      } catch (pusherErr) {
        console.warn("[togglePinMessage] Pusher warning:", pusherErr);
      }
    }

    return { success: true, message: updated };
  } catch (error: any) {
    console.error("[togglePinMessage] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markMessagesAsSeen(conversationId: string) {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await ensureUserExists(userId);

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
      try {
        await pusherServer.trigger(`chat-${conversationId}`, "messages-seen", { userId, conversationId });
      } catch (pusherErr) {
        console.warn("[markMessagesAsSeen] Pusher warning:", pusherErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("[markMessagesAsSeen] Error:", error);
    return { success: false, error: error.message };
  }
}
