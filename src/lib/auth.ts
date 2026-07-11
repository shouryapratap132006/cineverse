// Shared auth helper for API routes and server code

export async function getAuthUserId(): Promise<string | null> {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (hasClerkKey) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const session = await auth();
      if (session.userId) return session.userId;
    } catch (e) {
      console.error("[auth] Clerk auth failed:", e);
    }
  }

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

  return null;
}
