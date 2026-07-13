// ============================================================
// POST /api/ai/companion — General-purpose movie companion
// Uses Groq directly for reliability; falls back to TMDB search
// ============================================================

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

async function fetchTmdbMovie(title: string) {
  try {
    const res = await fetch(
      `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] ?? null;
  } catch {
    return null;
  }
}

async function askGroq(systemPrompt: string, userPrompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, context } = body as { prompt?: string; context?: string };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are CineVerse AI Companion — an expert film critic and recommendation engine with encyclopedic knowledge of cinema.

The user will ask you anything about movies: what to watch, mood-based picks, hidden gems, comparisons, trivia, etc.
${context ? `Context: ${context}` : ""}

Respond in this EXACT JSON format only (no markdown, no code fences, no extra text before or after):
{"movieTitle":"Exact official movie title","movieYear":2024,"response":"2-3 sentence engaging explanation of why this movie fits. Be specific and enthusiastic.","tags":["tag1","tag2","tag3"]}

Rules:
- Recommend one real, existing film
- movieTitle must be the exact searchable TMDB title
- Be creative and match the user's mood/vibe
- tags should describe the film's feel (e.g. "mind-bending", "feel-good", "intense")`;

    let parsed: { movieTitle: string; movieYear: number; response: string; tags: string[] } | null = null;

    if (GROQ_KEY) {
      try {
        const raw = await askGroq(systemPrompt, prompt.trim());

        // Strip any accidental markdown fences
        const cleaned = raw
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();

        // Extract the JSON object
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        const jsonStr = start !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned;
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("[companion] Groq/parse error:", e);
        // Fall through to TMDB-only fallback
      }
    }

    // If AI failed or no key, do a smart TMDB search as fallback
    if (!parsed) {
      const tmdbFallback = await fetchTmdbMovie(prompt.trim());
      if (tmdbFallback) {
        return NextResponse.json({
          success: true,
          movieTitle: tmdbFallback.title,
          movieYear: tmdbFallback.release_date?.slice(0, 4),
          response: tmdbFallback.overview || "A great match for your query.",
          tags: [],
          tmdb: {
            id: String(tmdbFallback.id),
            title: tmdbFallback.title,
            posterPath: tmdbFallback.poster_path ?? null,
            rating: tmdbFallback.vote_average ?? null,
            overview: tmdbFallback.overview ?? null,
            releaseDate: tmdbFallback.release_date ?? null,
          },
        });
      }

      return NextResponse.json({ error: "Could not generate a recommendation." }, { status: 500 });
    }

    // Fetch real TMDB data for the AI's recommended movie
    const tmdbMovie = await fetchTmdbMovie(parsed.movieTitle);

    return NextResponse.json({
      success: true,
      movieTitle: parsed.movieTitle,
      movieYear: parsed.movieYear,
      response: parsed.response,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      tmdb: tmdbMovie
        ? {
            id: String(tmdbMovie.id),
            title: tmdbMovie.title,
            posterPath: tmdbMovie.poster_path ?? null,
            rating: tmdbMovie.vote_average ?? null,
            overview: tmdbMovie.overview ?? null,
            releaseDate: tmdbMovie.release_date ?? null,
          }
        : null,
    });
  } catch (error) {
    console.error("[/api/ai/companion] Unhandled error:", error);
    const message = error instanceof Error ? error.message : "AI companion error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
