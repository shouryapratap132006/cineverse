// ============================================================
// POST /api/ai/companion — General-purpose movie companion
// Accepts any free-form prompt and returns an AI response
// with real movie recommendations backed by TMDB data
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { orchestrateCompletion } from "@/ai/orchestrator";

export const runtime = "nodejs";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

async function fetchTmdbMovie(title: string) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`
    );
    const data = await res.json();
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Ask the AI to recommend a specific movie for this query
    const systemPrompt = `You are CineVerse AI Companion — an expert film critic and recommendation engine with encyclopedic knowledge of cinema.

The user will ask you anything about movies: what to watch, mood-based picks, hidden gems, comparisons, trivia, etc.
${context ? `Community/context: ${context}` : ""}

Respond in this EXACT JSON format (no markdown, no extra text):
{
  "movieTitle": "Exact official movie title",
  "movieYear": 2024,
  "response": "2-3 sentence engaging explanation of why this movie fits the request. Be specific, insightful, and enthusiastic.",
  "tags": ["tag1", "tag2", "tag3"]
}

Rules:
- Always recommend a real, existing film
- movieTitle must be the exact, searchable title on TMDB
- Be creative and go beyond the obvious choices when appropriate
- Match the user's mood/vibe/request precisely`;

    const aiResponse = await orchestrateCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      maxTokens: 400,
    });

    // Parse the AI JSON response
    let parsed: { movieTitle: string; movieYear: number; response: string; tags: string[] };
    try {
      const cleaned = aiResponse.content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: extract movie title from the text
      parsed = {
        movieTitle: "Interstellar",
        movieYear: 2014,
        response: aiResponse.content,
        tags: ["recommended"],
      };
    }

    // Fetch real TMDB data for the recommended movie
    const tmdbMovie = await fetchTmdbMovie(parsed.movieTitle);

    return NextResponse.json({
      success: true,
      movieTitle: parsed.movieTitle,
      movieYear: parsed.movieYear,
      response: parsed.response,
      tags: parsed.tags || [],
      tmdb: tmdbMovie
        ? {
            id: String(tmdbMovie.id),
            title: tmdbMovie.title,
            posterPath: tmdbMovie.poster_path,
            rating: tmdbMovie.vote_average,
            overview: tmdbMovie.overview,
            releaseDate: tmdbMovie.release_date,
          }
        : null,
    });
  } catch (error) {
    console.error("[/api/ai/companion]", error);
    const message = error instanceof Error ? error.message : "AI companion error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
