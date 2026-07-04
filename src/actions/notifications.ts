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

export async function getNotifications(page = 1, limit = 20) {
  const userId = await getUserId();
  if (!userId) return { success: false, notifications: [] };

  try {
    const notifications = await db.notification.findMany({
      where: { receiverId: userId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          include: { profile: true },
        },
      },
    });

    return { success: true, notifications };
  } catch (error: any) {
    console.error("Get Notifications Error:", error);
    return { success: false, error: error.message };
  }
}

export async function markNotificationRead(id: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const notification = await db.notification.findUnique({ where: { id } });
    if (!notification || notification.receiverId !== userId) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsRead() {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await db.notification.updateMany({
      where: { receiverId: userId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadNotificationCount() {
  const userId = await getUserId();
  if (!userId) return { count: 0 };

  try {
    const count = await db.notification.count({
      where: { receiverId: userId, isRead: false },
    });
    return { count };
  } catch {
    return { count: 0 };
  }
}
