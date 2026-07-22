import { NextRequest, NextResponse } from "next/server";

// Streaming image proxy for TMDB media (image.tmdb.org).
//
// India blocks TMDB, so the browser cannot load poster/backdrop/avatar images directly.
// This route runs on the EU EC2 host, fetches the image server-side, and streams the raw
// bytes back to the client from our own origin. It only passes bytes through — no resizing
// or re-encoding — so it stays light enough for the 1 GB t3.micro instance.
//
// Usage: /api/tmdb/img?path=/t/p/w500/abc.jpg   (path == everything after image.tmdb.org)

const TMDB_IMAGE_HOST = "https://image.tmdb.org";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "path parameter is required" }, { status: 400 });
  }

  // SSRF guard: only allow the TMDB image path shape (/t/p/<size>/<file>).
  if (!path.startsWith("/t/p/")) {
    return NextResponse.json({ error: "invalid image path" }, { status: 400 });
  }

  const targetUrl = `${TMDB_IMAGE_HOST}${path}`;

  try {
    const upstream = await fetch(targetUrl, {
      // Cache upstream fetches for a day; posters are effectively immutable.
      next: { revalidate: 86400 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `TMDB image error: ${upstream.status}` },
        { status: upstream.status || 502 }
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        // Immutable content — let the browser and any CDN cache it aggressively.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
