import { db } from "@/lib/db";

export async function getAuthUserId(): Promise<string | null> {
  // 1. Try Clerk Auth first if configured
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      if (session?.userId) return session.userId;
    } catch (e) {
      // Fallback silently
    }
  }

  // 2. Try custom session cookie (cineverse_session)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const mockSession = cookieStore.get("cineverse_session");
    if (mockSession) {
      const data = JSON.parse(mockSession.value) as { id?: string };
      if (data.id) return data.id;
    }
  } catch {
    // ignore malformed session cookie
  }

  // 3. Primary DB user fallback
  try {
    const user = await db.user.findFirst({ select: { id: true } });
    if (user) return user.id;
  } catch {}

  return null;
}
