# `src/ai/` Directory Overview

The `src/ai/` directory houses **CineVerse's Artificial Intelligence Engine**, responsible for multi-agent LLM orchestration, vector taste profiling, semantic search expansion, and content moderation.

## 📂 Directory Layout

```
src/ai/
├── gateway.ts                 # Unified AI Gateway initializing Groq SDK client
├── orchestrator.ts            # LangGraph agent state graph router & manager
├── prompts/                   # System prompt templates & context formats
├── providers/                 # Provider drivers (Groq, OpenAI, Mock fallbacks)
├── services/                  # Specialized domain AI services
│   ├── taste.service.ts       # Movie DNA vector computation & radar generation
│   ├── recommendation.ts      # Hybrid content & LLM scoring service
│   ├── semanticSearch.ts      # Prompt expansion & intent matching
│   ├── movieAssistant.ts     # Conversational film bot logic
│   ├── moderation.service.ts  # Safety & toxicity filter
│   └── watchlist.service.ts   # Smart collection clustering
└── types/                     # Zod schemas & TypeScript definitions
```

## 🧠 Core Architecture Highlights
- **Groq Acceleration**: Leverages `llama-3.3-70b-versatile` for low-latency JSON extraction and recommendations.
- **LangGraph Nodes**: Declarative state graph managing turn-by-turn agent state and intent switches.
- **Zod Structured Output**: LLM outputs are guaranteed to conform to strict TypeScript interfaces.

For in-depth AI architectural documentation, see [docs/ai/INDEX.md](../../docs/ai/INDEX.md).
