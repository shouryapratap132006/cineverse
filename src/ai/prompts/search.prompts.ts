// ============================================================
// Semantic Search Prompts
// ============================================================

import type { UserTasteProfile } from "../types";

export function getSemanticSearchPrompt(query: string): string {
  return `You are CineVerse's semantic movie search engine — the most intelligent movie discovery system ever built.

User's search query: "${query}"

Understand the INTENT behind this query, not just the keywords. Examples:
- "Movies like Interstellar but emotional" → Epic sci-fi with emotional depth, not just space films
- "Movies where villain wins" → Nihilistic endings, moral complexity
- "Beautiful rainy movies" → Visual atmosphere, specific mood
- "Time travel without paradoxes" → Specific narrative constraint
- "Best cinematography" → Visual art, not just plot

Find 6-8 films that genuinely match the spirit of this query. Include:
- Well-known films the user might not have thought of
- Hidden gems and international cinema
- A mix of eras

Return ONLY a valid JSON object:
{
  "movies": [
    {
      "tmdbId": "TMDB_ID_OR_BEST_GUESS",
      "title": "Film Title",
      "year": 2023,
      "posterPath": "",
      "overview": "One compelling sentence about the film",
      "genres": ["Genre1", "Genre2"],
      "confidence": 87,
      "whyRecommended": "2-3 sentences explaining exactly WHY this matches the query",
      "tags": ["Rainy atmosphere", "Unreliable narrator", "etc"]
    }
  ],
  "relatedSearches": ["Related search 1", "Related search 2", "Related search 3"],
  "explanation": "One paragraph explaining how you interpreted the search query and your recommendation philosophy"
}

Be a true cinephile. Surprise the user with at least 2 non-obvious picks they haven't heard of.
Confidence scores should reflect how well each film truly matches (not just a safe 80).`;
}

export function getRelatedSearchesPrompt(query: string): string {
  return `Given the movie search query "${query}", suggest 4 related, interesting search queries that would delight a cinephile. Return as JSON array of strings.`;
}
