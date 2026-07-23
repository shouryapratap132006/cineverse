# Semantic Search & Intent Matching Architecture

CineVerse replaces rigid keyword search with **Natural Language Semantic Search**, allowing users to search using complex queries like *"Cozy 90s mystery set in a rainy small town with a melancholic soundtrack"*.

---

## 🔍 Semantic Pipeline

1. **Natural Language Query Input**: User types a conversational search query.
2. **Groq Intent Expansion**: `src/ai/services/semanticSearch.service.ts` passes the query to Groq LLaMA 3.3 to extract structured search facets:
   ```json
   {
     "keywords": ["small town", "rainy", "cozy", "90s"],
     "genres": ["Mystery", "Drama"],
     "decade": "1990s",
     "mood": "Melancholic",
     "tmdbSearchTerms": ["mystery small town", "90s detective"]
   }
   ```
3. **Multi-Query TMDB Retrieval**: The extracted terms are dispatched in parallel to the TMDB API proxy.
4. **Result Reranking & Scoring**: Returned movie candidates are reranked by semantic closeness to the original user intent.
