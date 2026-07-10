// ============================================================
// AI Daily Page Prompts
// ============================================================

export function getDailyPagePrompt(dateStr: string): string {
  return `You are CineVerse's daily content curator. Generate today's unique cinema content for ${dateStr}.

Create fresh, genuinely interesting daily content. Consider:
- Film anniversaries, birthdays of directors/actors today
- Historical cinema events
- Seasonal themes (weather, holidays, cultural moments)
- Connections between different films/filmmakers

Return ONLY a valid JSON object:
{
  "date": "${dateStr}",
  "todaysMovie": {
    "tmdbId": "numeric_id",
    "title": "Film Title",
    "year": 1999,
    "posterPath": "",
    "whyToday": "Why this specific film deserves attention today — connect to date/anniversary/theme",
    "tagline": "An original, compelling tagline for this film (not the official one)",
    "funFact": "Genuinely surprising fact most people don't know about this film"
  },
  "todaysDirector": {
    "name": "Director Name",
    "photoUrl": "",
    "birthYear": 1946,
    "nationality": "American",
    "notableWork": "Their most important film",
    "whyToday": "Why spotlight this director today",
    "quote": "A real, inspiring quote from this director about filmmaking"
  },
  "hiddenGem": {
    "tmdbId": "numeric_id",
    "title": "Underrated Film Title",
    "year": 2007,
    "posterPath": "",
    "whyToday": "Why this hidden gem deserves discovery",
    "tagline": "What makes this film special",
    "funFact": "Why this film was overlooked and what critics said later"
  },
  "challenge": {
    "title": "Challenge Title (e.g., 'The One-Location Challenge')",
    "description": "Watch 3 films set entirely in one location. Notice how confined spaces create tension.",
    "difficulty": "medium",
    "reward": "What the viewer gains from completing this",
    "exampleMovies": ["Rear Window", "Phone Booth", "Buried"]
  },
  "quote": {
    "quote": "Memorable movie quote",
    "movie": "Film Title",
    "character": "Character Name",
    "year": 1994
  },
  "discussion": {
    "question": "Provocative, genuinely interesting film discussion question",
    "context": "2 sentences providing context and why this is worth debating",
    "tags": ["relevant", "tags", "here"]
  }
}

Make today's content feel genuinely curated, not random. Find real connections.`;
}
