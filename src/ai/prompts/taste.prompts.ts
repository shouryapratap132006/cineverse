// ============================================================
// Movie DNA / Taste Profile Prompts
// ============================================================

import type { UserTasteProfile } from "../types";

export function getMovieDNAPrompt(profile: UserTasteProfile, username: string): string {
  return `You are CineVerse's taste analysis engine — like Spotify Wrapped but for cinema.

Analyze this user's complete film taste profile and generate their unique "Movie DNA":

User: ${username}
Favorite Genres: ${profile.favoriteGenres?.join(", ") || "Not set"}
Favorite Directors: ${profile.favoriteDirectors?.join(", ") || "Not set"}
Favorite Actors: ${profile.favoriteActors?.join(", ") || "Not set"}
Favorite Movies: ${profile.favoriteMovies?.join(", ") || "Not set"}
Watched Movies: ${profile.watchedMovieTitles?.slice(0, 20).join(", ") || "Not set"}
Average Rating Given: ${profile.averageRating ?? "Unknown"}/10

Based on this, generate their complete Movie DNA profile:

Return ONLY a valid JSON object:
{
  "personality": "The [Adjective] [Noun] — e.g., 'The Auteur Explorer', 'The Sci-Fi Dreamer', 'The Festival Critic'",
  "personalityDescription": "2-3 sentence description of this cinematic personality type",
  "tasteScore": 75,
  "topGenres": [
    { "genre": "Science Fiction", "percentage": 35, "color": "#8B5CF6" },
    { "genre": "Drama", "percentage": 28, "color": "#3B82F6" },
    { "genre": "Thriller", "percentage": 20, "color": "#EF4444" },
    { "genre": "Documentary", "percentage": 12, "color": "#10B981" },
    { "genre": "Animation", "percentage": 5, "color": "#F59E0B" }
  ],
  "topDirectors": ["Director 1", "Director 2", "Director 3"],
  "topActors": ["Actor 1", "Actor 2", "Actor 3"],
  "topThemes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4", "Theme 5"],
  "favoriteCountries": ["USA", "France", "South Korea"],
  "visualStyle": ["Slow Cinema", "Neo-Noir", "Hyper-stylized"],
  "pacing": "Patient Viewer",
  "favoritDecade": "2010s",
  "moodBoard": ["Cerebral", "Atmospheric", "Melancholic", "Visually Ambitious"],
  "profileSummary": "A rich 2-3 sentence description like: 'You navigate cinema like a seasoned traveler — drawn to emotionally complex characters and the patient storytelling of Denis Villeneuve and Yorgos Lanthimos. Your taste bridges the analytical and the emotional, with a particular love for films that reward repeat viewings.'",
  "stats": {
    "moviesWatched": 47,
    "reviewsWritten": 12,
    "averageRating": 7.8,
    "mostWatchedGenre": "Science Fiction"
  }
}

The tasteScore (0-100) reflects cinephile depth: 
- 90-100: Serious film scholar (watches Tarkovsky, rates analytically)
- 70-89: Dedicated cinephile (broad taste, international cinema, arthouse + mainstream)
- 50-69: Enthusiast (genre favorites, some exploration)
- 30-49: Casual viewer (mainstream focus)

Make the personality feel genuinely personal, not generic.`;
}

export function getProfileSummaryPrompt(profile: UserTasteProfile, username: string): string {
  return `Generate a single compelling paragraph (3-4 sentences) that describes ${username}'s film taste as if written by a knowledgeable friend. 

Their taste:
- Genres: ${profile.favoriteGenres?.join(", ")}
- Directors: ${profile.favoriteDirectors?.join(", ")}
- Favorite films: ${profile.favoriteMovies?.join(", ")}

Make it feel personal and insightful, like a well-crafted bio. Reference specific directors or films they love. Don't use generic phrases like "film enthusiast" or "lover of cinema."

Return ONLY the paragraph text.`;
}
