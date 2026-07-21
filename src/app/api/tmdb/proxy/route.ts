import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB API key not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint parameter is required" }, { status: 400 });
  }

  // Sanitize endpoint to prevent SSRF
  if (!endpoint.startsWith("/")) {
    return NextResponse.json({ error: "Invalid endpoint format" }, { status: 400 });
  }

  const queryParams = new URLSearchParams(searchParams);
  queryParams.delete("endpoint");
  queryParams.set("api_key", apiKey);

  const targetUrl = `${TMDB_BASE}${endpoint}?${queryParams.toString()}`;

  try {
    const res = await fetch(targetUrl, { next: { revalidate: 1800 } });
    if (!res.ok) {
      return NextResponse.json({ error: `TMDB error: ${res.statusText}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch from TMDB" }, { status: 500 });
  }
}
