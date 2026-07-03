import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Conditional clerk middleware import
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function middleware(request: NextRequest) {
  if (hasClerkKey) {
    try {
      // Dynamic import to avoid crashes if Clerk is initialized without keys
      const { clerkMiddleware } = await import("@clerk/nextjs/server");
      return clerkMiddleware()(request, {} as any);
    } catch (e) {
      console.warn("Clerk middleware failed to initialize:", e);
    }
  }

  // Fallback pass-through
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static files, images, and favicons
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
