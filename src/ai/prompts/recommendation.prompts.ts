// ============================================================
// Recommendation Engine Prompts
// ============================================================

import type { UserTasteProfile, RecommendationType } from "../types";

export function getRecommendationSystemPrompt(): string {
  return `You are CineVerse's personalized recommendation engine — more sophisticated than Netflix, more personal than Letterboxd.

You have access to a user's complete taste profile including their favorite movies, genres, directors, and viewing history. 
Your recommendations should feel like they come from a brilliant film-critic friend who knows the user intimately.

Rules:
- Never recommend films the user has already listed as favorites or watched
- Mix mainstream and arthouse
- Include international cinema when appropriate
- Each recommendation MUST have a specific, personalized "why" that references the user's actual taste
- Vary the recommendations — not just "more of the same"
- Include films from different decades for variety
- Match scores should be honest (60-98 range)`;
}

export function getRecommendationPrompt(
  type: RecommendationType,
  profile: UserTasteProfile
): string {
  const profileContext = `
User Taste Profile:
- Favorite Genres: ${profile.favoriteGenres?.join(", ") || "Not specified"}
- Favorite Directors: ${profile.favoriteDirectors?.join(", ") || "Not specified"}  
- Favorite Actors: ${profile.favoriteActors?.join(", ") || "Not specified"}
- Favorite Movies: ${profile.favoriteMovies?.slice(0, 8).join(", ") || "Not specified"}
- Recently Watched: ${profile.watchedMovieTitles?.slice(0, 5).join(", ") || "Not specified"}`;

  const typeConfig: Record<RecommendationType, { title: string; prompt: string; count: number }> = {
    today_pick: {
      title: "Today's Pick",
      prompt: "Recommend 1 perfect film for today based on this user's taste. Make it feel curated and special — like a sommelier selecting the perfect wine.",
      count: 1,
    },
    weekend_marathon: {
      title: "Weekend Marathon",
      prompt: "Curate 4-5 films for a weekend marathon that flow well together thematically. Create a mini film festival experience.",
      count: 5,
    },
    because_you_loved: {
      title: "Because You Loved...",
      prompt: "Pick their most recently liked/favorited film and recommend 4 films with similar DNA — director style, themes, mood, or cinematic language.",
      count: 4,
    },
    hidden_gems: {
      title: "Hidden Gems",
      prompt: "Recommend 5 underrated, lesser-known films that match this user's taste. Films with IMDb ratings under 50k votes but critically acclaimed.",
      count: 5,
    },
    award_winners: {
      title: "Award Winners",
      prompt: "Recommend 5 acclaimed, award-winning films from festivals (Cannes, Venice, Sundance, Oscars) that match this user's taste.",
      count: 5,
    },
    comfort_movies: {
      title: "Comfort Movies",
      prompt: "Recommend 5 warm, feel-good films perfect for when this user wants something comforting and emotionally safe.",
      count: 5,
    },
    mind_bending: {
      title: "Mind-Bending Collection",
      prompt: "Recommend 5 intellectually challenging, mind-bending films that will make this user think. Structural complexity, unreliable narrators, philosophical depth.",
      count: 5,
    },
    late_night: {
      title: "Late Night Movies",
      prompt: "Recommend 5 perfect late-night films — atmospheric, tension-filled, or darkly compelling. Films that reward watching alone at midnight.",
      count: 5,
    },
    international: {
      title: "International Collection",
      prompt: "Recommend 5 masterpieces from non-English cinema. Match the user's genre/theme preferences but from world cinema.",
      count: 5,
    },
    all: {
      title: "All Recommendations",
      prompt: "Provide 3 recommendations for each category: today_pick, weekend_marathon, hidden_gems, mind_bending, and international.",
      count: 15,
    },
  };

  const config = typeConfig[type] ?? typeConfig.hidden_gems;

  return `${profileContext}

Task: ${config.prompt}

Return ONLY a valid JSON object:
{
  "type": "${type}",
  "title": "${config.title}",
  "subtitle": "A one-line evocative subtitle for this collection",
  "emoji": "relevant emoji",
  "movies": [
    {
      "tmdbId": "numeric_tmdb_id",
      "title": "Film Title",
      "year": 2019,
      "posterPath": "",
      "overview": "Compelling one-sentence pitch",
      "genres": ["Genre1"],
      "rating": 8.5,
      "whyRecommended": "Specific reason referencing user's actual taste profile — e.g., 'Since you love Villeneuve's patient storytelling in Arrival...'",
      "matchScore": 87
    }
  ]
}

${config.count === 1 ? "Return exactly 1 movie." : `Return exactly ${config.count} movies.`}`;
}
