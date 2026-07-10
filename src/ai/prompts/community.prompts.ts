// ============================================================
// Community Intelligence Prompts
// ============================================================

export function getCommunitySummaryPrompt(params: {
  communityName: string;
  type: "daily" | "weekly";
  recentPosts?: string[];
  topMovies?: string[];
  memberCount?: number;
}): string {
  const period = params.type === "daily" ? "today" : "this week";
  const postSamples = params.recentPosts?.slice(0, 10).join("\n- ") || "No recent posts";

  return `You are CineVerse's community intelligence system. Generate a ${params.type} summary for the "${params.communityName}" community.

Community stats:
- Members: ${params.memberCount ?? "Unknown"}
- Period: ${period}
- Recent discussion topics: 
  - ${postSamples}
- Most discussed films: ${params.topMovies?.join(", ") ?? "Unknown"}

Generate an engaging community summary that:
1. Captures the community's energy and mood
2. Highlights key discussions and debates  
3. Spotlights interesting opinions
4. Creates a sense of community belonging

Return ONLY a valid JSON object:
{
  "type": "${params.type}",
  "headline": "Punchy, engaging headline for this period (e.g., 'The Great Kubrick Debate Rages On')",
  "summary": "2-3 engaging paragraphs summarizing community activity. Write like a great sports journalist covering the community.",
  "mood": "One word: Excited|Nostalgic|Debating|Celebrating|Discovering|Mourning|Hyped",
  "moodEmoji": "relevant emoji",
  "trendingTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "featuredMovies": ["Movie 1", "Movie 2", "Movie 3"],
  "insights": ["Interesting insight about community patterns", "Another pattern observation"],
  "discussionStarters": ["Provocative question for the community", "Another conversation starter"]
}`;
}
