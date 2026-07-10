// ============================================================
// Movie Companion & Scene Explorer Prompts
// ============================================================

export function getMovieCompanionSystemPrompt(movie: {
  title: string;
  overview: string;
  year?: number;
  genres?: string[];
  director?: string;
}): string {
  return `You are CineVerse AI — an expert film companion, cinema historian, and personal movie guide.

You are currently discussing the film: **${movie.title}** (${movie.year ?? "N/A"})
Director: ${movie.director ?? "Unknown"}
Genres: ${movie.genres?.join(", ") ?? "N/A"}
Overview: ${movie.overview}

Your personality:
- You speak like a brilliant film critic who deeply loves cinema
- You are warm, insightful, and intellectually engaging
- You reference film history, techniques, and cultural context naturally
- You can discuss a film at any depth — from casual viewer to academic level
- You never spoil future films the user hasn't asked about
- You format responses beautifully with markdown when helpful
- Keep responses concise but rich — never verbose for its own sake

When asked about:
- Endings/plot: Explain thoughtfully, ask if they want deeper analysis
- Symbolism: Draw connections to the director's broader work and film history
- Cinematography: Reference specific scenes, lighting choices, camera language
- Recommendations: Match the tone/theme/style of this film
- Trivia: Share genuinely interesting, lesser-known facts

Always stay focused on film. You are the world's most knowledgeable film companion.`;
}

export function getSceneAnalysisPrompt(
  movieTitle: string,
  sceneName: string,
  sceneDescription?: string
): string {
  return `Analyze the following scene from "${movieTitle}":
Scene: ${sceneName}
${sceneDescription ? `Description: ${sceneDescription}` : ""}

Provide a deep, film-school quality analysis covering:
1. Scene importance to the overall narrative
2. Cinematography (lighting, color palette, camera movement, shot types)
3. Editing rhythm and choices
4. Performance and dialogue
5. Music and sound design
6. Hidden symbolism and visual metaphors
7. Themes this scene develops
8. Fun/surprising behind-the-scenes facts
9. Why this scene became iconic or memorable
10. What a film student can learn from this scene

Format your response as a structured JSON object matching this TypeScript interface:
{
  "sceneName": string,
  "movieTitle": string,
  "importance": string,
  "cinematography": {
    "lighting": string,
    "colorPalette": string,
    "cameraMovement": string,
    "shotTypes": string[]
  },
  "editing": string,
  "performance": string,
  "dialogue": string,
  "music": string,
  "emotion": string,
  "hiddenSymbolism": string[],
  "themes": string[],
  "funFacts": string[],
  "whyIconic": string,
  "filmSchoolLesson": string
}

Be specific, scholarly, and insightful. Reference real film techniques by name.`;
}

export function getKnowledgeGraphPrompt(movie: {
  title: string;
  year?: number;
  director?: string;
  cast?: string[];
  genres?: string[];
}): string {
  return `Create a knowledge graph for the film "${movie.title}" (${movie.year ?? "N/A"}).
Director: ${movie.director ?? "Unknown"}
Cast: ${movie.cast?.slice(0, 5).join(", ") ?? "Unknown"}
Genres: ${movie.genres?.join(", ") ?? "Unknown"}

Generate a rich knowledge graph connecting this film to:
- Key cast members and their other notable works
- Director and their filmography style
- Themes and motifs
- Similar films (3-5)
- Music composer and their style
- Production studio/era
- Cultural/historical context

Return ONLY a valid JSON object:
{
  "centerNode": { "id": "main", "label": "${movie.title}", "type": "movie", "weight": 10, "color": "#8B5CF6", "description": "brief description" },
  "nodes": [
    { "id": "unique_id", "label": "Node Label", "type": "movie|person|theme|genre|studio|award", "weight": 1-10, "color": "hex_color", "description": "brief" }
  ],
  "edges": [
    { "source": "id1", "target": "id2", "label": "relationship", "strength": 1-10 }
  ]
}

Include 12-18 nodes total. Use these colors: person=#3B82F6, theme=#10B981, genre=#F59E0B, movie=#8B5CF6, studio=#EF4444, award=#F97316.
Make connections genuinely insightful, not just obvious facts.`;
}

export const MOVIE_COMPANION_SUGGESTED_PROMPTS = [
  { label: "Explain ending", prompt: "Can you explain the ending and what it means?", icon: "🎬" },
  { label: "Hidden symbolism", prompt: "What hidden symbolism and visual metaphors are in this film?", icon: "🔍" },
  { label: "Director's style", prompt: "How does this film showcase the director's unique style?", icon: "🎥" },
  { label: "Character analysis", prompt: "Give me a deep character analysis of the main protagonist.", icon: "🎭" },
  { label: "Cinematography", prompt: "Explain the cinematography choices and their emotional impact.", icon: "📽️" },
  { label: "Similar movies", prompt: "Recommend similar movies I should watch next.", icon: "🎞️" },
  { label: "Soundtrack", prompt: "Tell me about the soundtrack and how it enhances the film.", icon: "🎵" },
  { label: "Oscar history", prompt: "What awards did this film win or get nominated for?", icon: "🏆" },
  { label: "Plot holes", prompt: "Are there any plot holes or inconsistencies in this film?", icon: "❓" },
  { label: "Behind the scenes", prompt: "Share interesting behind-the-scenes stories from this production.", icon: "🎪" },
  { label: "Color grading", prompt: "Explain the color grading and visual palette choices.", icon: "🎨" },
  { label: "Timeline", prompt: "Break down the film's timeline and narrative structure.", icon: "⏱️" },
];
