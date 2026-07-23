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

  // The endpoint may itself carry a query string, e.g. "/discover/movie?with_genres=28&sort_by=...".
  // Split path from its inline query so we don't emit a malformed URL with two "?" — that was
  // stripping the api_key and making TMDB return 401 for every row/filter that used /discover etc.
  const queryIndex = endpoint.indexOf("?");
  const path = queryIndex === -1 ? endpoint : endpoint.slice(0, queryIndex);
  const inlineQuery = queryIndex === -1 ? "" : endpoint.slice(queryIndex + 1);

  const queryParams = new URLSearchParams(inlineQuery);
  // Merge any params passed alongside endpoint (e.g. &query=...&page=...).
  for (const [key, value] of searchParams.entries()) {
    if (key === "endpoint") continue;
    queryParams.set(key, value);
  }
  queryParams.set("api_key", apiKey);

  const targetUrl = `${TMDB_BASE}${path}?${queryParams.toString()}`;

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
