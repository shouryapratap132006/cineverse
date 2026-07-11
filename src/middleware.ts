import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Protected paths definitions
const protectedPaths = ["/dashboard", "/onboarding"];

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (hasClerkKey) {
    try {
      const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
      const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);
      
      return clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
          await auth.protect();
        }
      })(request, event);
    } catch (e) {
      console.warn("Clerk middleware failed, falling back to basic routing:", e);
    }
  }

  // Fallback Route Protection (reads local session cookie)
  if (isProtected(pathname)) {
    const sessionCookie = request.cookies.get("cineverse_session");
    if (!sessionCookie) {
      // Unauthenticated access - redirect to Sign In
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      // Pass original redirect url
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except static assets, images, and favicons
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
