// ============================================================
// CineVerse AI Layer — Type Definitions
// ============================================================

export type AIRole = "user" | "assistant" | "system";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIStreamChunk {
  delta: string;
  done: boolean;
}

// ────────────────────────────────────────────────────────────
// Movie Companion
// ────────────────────────────────────────────────────────────

export interface MovieCompanionRequest {
  movieId: string;
  movieTitle: string;
  movieOverview?: string;
  genres?: string[];
  director?: string;
  year?: number;
  messages: AIMessage[];
}

export interface MovieCompanionSuggestedPrompt {
  label: string;
  prompt: string;
  icon: string;
}

// ────────────────────────────────────────────────────────────
// Semantic Search
// ────────────────────────────────────────────────────────────

export interface SemanticSearchRequest {
  query: string;
  limit?: number;
}

export interface SemanticSearchResult {
  movies: SemanticMovieResult[];
  relatedSearches: string[];
  explanation: string;
}

export interface SemanticMovieResult {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  confidence: number; // 0-100
  whyRecommended: string;
  tags: string[];
}

// ────────────────────────────────────────────────────────────
// Recommendations
// ────────────────────────────────────────────────────────────

export type RecommendationType =
  | "today_pick"
  | "weekend_marathon"
  | "because_you_loved"
  | "hidden_gems"
  | "award_winners"
  | "comfort_movies"
  | "mind_bending"
  | "late_night"
  | "international"
  | "all";

export interface RecommendationRequest {
  userId: string;
  type: RecommendationType;
  userProfile: UserTasteProfile;
}

export interface RecommendationSet {
  type: RecommendationType;
  title: string;
  subtitle: string;
  emoji: string;
  movies: RecommendedMovie[];
}

export interface RecommendedMovie {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  rating?: number;
  whyRecommended: string;
  matchScore: number; // 0-100
}

// ────────────────────────────────────────────────────────────
// Movie DNA / Taste Profile
// ────────────────────────────────────────────────────────────

export interface UserTasteProfile {
  favoriteGenres: string[];
  favoriteDirectors: string[];
  favoriteActors: string[];
  favoriteMovies: string[];
  watchedMovieTitles?: string[];
  reviewedMovies?: string[];
  averageRating?: number;
}

export interface MovieDNA {
  personality: string; // e.g. "The Auteur Explorer"
  personalityDescription: string;
  tasteScore: number; // 0-100 cinephile score
  topGenres: GenreBreakdown[];
  topDirectors: string[];
  topActors: string[];
  topThemes: string[];
  favoriteCountries: string[];
  visualStyle: string[]; // e.g. ["Slow Cinema", "Neo-Noir"]
  pacing: string; // e.g. "Patient Viewer"
  favoritDecade: string;
  moodBoard: string[]; // descriptive adjectives
  profileSummary: string; // paragraph summary
  stats: {
    moviesWatched: number;
    reviewsWritten: number;
    averageRating: number;
    mostWatchedGenre: string;
  };
}

export interface GenreBreakdown {
  genre: string;
  percentage: number;
  color: string;
}

// ────────────────────────────────────────────────────────────
// Review Assistant
// ────────────────────────────────────────────────────────────

export type ReviewAction =
  | "improve"
  | "expand"
  | "shorten"
  | "professional"
  | "funny"
  | "spoiler_free"
  | "grammar"
  | "translate"
  | "generate_title"
  | "summarize";

export interface ReviewAssistantRequest {
  content: string;
  action: ReviewAction;
  targetLanguage?: string;
  movieTitle?: string;
}

export interface ReviewAssistantResponse {
  result: string;
  original: string;
  action: ReviewAction;
}

// ────────────────────────────────────────────────────────────
// Watchlist Builder
// ────────────────────────────────────────────────────────────

export interface WatchlistBuilderRequest {
  prompt: string;
  userProfile?: UserTasteProfile;
  count?: number;
}

export interface GeneratedWatchlist {
  name: string;
  description: string;
  mood: string;
  emoji: string;
  movies: WatchlistMovie[];
  estimatedRuntime: number; // minutes
}

export interface WatchlistMovie {
  tmdbId: string;
  title: string;
  year: number;
  posterPath: string;
  overview: string;
  genres: string[];
  runtime?: number;
  reason: string;
  orderNote: string; // e.g. "Start here", "Perfect follow-up"
}

// ────────────────────────────────────────────────────────────
// Scene Explorer
// ────────────────────────────────────────────────────────────

export interface SceneAnalysisRequest {
  movieId: string;
  movieTitle: string;
  sceneName: string;
  sceneDescription?: string;
}

export interface SceneAnalysis {
  sceneName: string;
  movieTitle: string;
  importance: string;
  cinematography: {
    lighting: string;
    colorPalette: string;
    cameraMovement: string;
    shotTypes: string[];
  };
  editing: string;
  performance: string;
  dialogue: string;
  music: string;
  emotion: string;
  hiddenSymbolism: string[];
  themes: string[];
  funFacts: string[];
  whyIconic: string;
  filmSchoolLesson: string;
}

// ────────────────────────────────────────────────────────────
// Knowledge Graph
// ────────────────────────────────────────────────────────────

export interface KnowledgeGraphRequest {
  movieId: string;
  movieTitle: string;
  year?: number;
  director?: string;
  cast?: string[];
  genres?: string[];
}

export interface KnowledgeGraph {
  centerNode: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: "movie" | "person" | "theme" | "genre" | "studio" | "award";
  weight: number; // 1-10, affects size
  color?: string;
  description?: string;
  posterPath?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  strength: number; // 1-10
}

// ────────────────────────────────────────────────────────────
// Community Intelligence
// ────────────────────────────────────────────────────────────

export interface CommunitySummaryRequest {
  communityId: string;
  communityName: string;
  type: "daily" | "weekly";
  recentPosts?: string[];
  topMovies?: string[];
  memberCount?: number;
}

export interface CommunitySummary {
  type: "daily" | "weekly";
  headline: string;
  summary: string;
  mood: string; // e.g. "Excited", "Nostalgic", "Debating"
  moodEmoji: string;
  trendingTopics: string[];
  featuredMovies: string[];
  insights: string[];
  discussionStarters: string[];
}

// ────────────────────────────────────────────────────────────
// Daily Page
// ────────────────────────────────────────────────────────────

export interface DailyContent {
  date: string;
  todaysMovie: DailyMovie;
  todaysDirector: DailyDirector;
  hiddenGem: DailyMovie;
  challenge: DailyChallenge;
  quote: DailyQuote;
  discussion: DailyDiscussion;
}

export interface DailyMovie {
  tmdbId?: string;
  title: string;
  year: number;
  posterPath?: string;
  whyToday: string;
  tagline: string;
  funFact: string;
}

export interface DailyDirector {
  name: string;
  photoUrl?: string;
  birthYear?: number;
  nationality: string;
  notableWork: string;
  whyToday: string;
  quote?: string;
}

export interface DailyChallenge {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  reward: string;
  exampleMovies: string[];
}

export interface DailyQuote {
  quote: string;
  movie: string;
  character?: string;
  year: number;
}

export interface DailyDiscussion {
  question: string;
  context: string;
  tags: string[];
}

// ────────────────────────────────────────────────────────────
// Film Professor
// ────────────────────────────────────────────────────────────

export interface FilmProfessorRequest {
  topic: string;
  level?: "beginner" | "intermediate" | "advanced";
  messages: AIMessage[];
}

export type FilmTopic =
  | "editing"
  | "lighting"
  | "directing"
  | "writing"
  | "screenplay"
  | "color_theory"
  | "shot_composition"
  | "camera_angles"
  | "sound_design"
  | "production_design"
  | "acting"
  | "cinematography";

// ────────────────────────────────────────────────────────────
// Friend Matching
// ────────────────────────────────────────────────────────────

export interface FriendMatch {
  userId: string;
  username: string;
  avatarUrl?: string;
  similarityScore: number; // 0-100
  sharedMovies: string[];
  sharedGenres: string[];
  sharedCommunities: string[];
  conversationStarters: string[];
  matchReason: string;
}

// ────────────────────────────────────────────────────────────
// Moderation
// ────────────────────────────────────────────────────────────

export interface ModerationRequest {
  content: string;
  type: "post" | "review" | "comment";
  context?: string;
}

export interface ModerationResult {
  isAllowed: boolean;
  flags: ModerationFlag[];
  suggestedTags?: string[];
  cleanedContent?: string;
  severity: "none" | "low" | "medium" | "high";
}

export interface ModerationFlag {
  type: "spam" | "abuse" | "spoiler" | "off_topic" | "duplicate" | "toxicity";
  confidence: number;
  explanation: string;
}

// ────────────────────────────────────────────────────────────
// AI Conversation (persistence)
// ────────────────────────────────────────────────────────────

export interface StoredConversation {
  id: string;
  userId: string;
  title: string;
  type: "movie" | "search" | "professor" | "general";
  isPinned: boolean;
  folderId?: string;
  messages: StoredMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredMessage {
  id: string;
  conversationId: string;
  role: AIRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
