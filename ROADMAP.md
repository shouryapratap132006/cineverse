# CineVerse Product & Technical Roadmap

This roadmap outlines the past, current, and future direction of **CineVerse**. We welcome community input and contributions across all roadmap items!

---

## 🟢 Completed (v0.1.0 Baseline)

- [x] **Full-Stack Next.js 16 App Router Integration** with React 19 & Tailwind CSS v4.
- [x] **Hybrid AI Recommendation Engine** powered by Groq (LLaMA 3.3 70B) & custom taste scoring algorithm.
- [x] **Movie DNA Visualization Radar** mapping cinematic taste attributes (Mood, Tempo, Visual Style, Narrative Complexity).
- [x] **Natural Language Semantic Search** allowing conversational movie discovery.
- [x] **LangGraph Multi-Agent Architecture** with fallback provider support and memory context.
- [x] **Real-Time Watch Parties & Chat** using custom HTTP + Socket.IO server & Pusher channels.
- [x] **Clerk Authentication** with webhooks and automated Prisma PostgreSQL sync.
- [x] **Stripe Subscription Tiers** (Free & CineVerse Pro tier features).
- [x] **Cloudinary Media Pipeline** for avatar & poster uploads.
- [x] **Production Docker Containerization** with multi-stage Dockerfile & Caddy reverse proxy setup.
- [x] **Automated AWS EC2 Deployment Pipeline** via GitHub Actions & GitHub Container Registry (GHCR).

---

## 🟡 In Progress (v0.2.0 Active Development)

- [ ] **Redis Caching Layer for TMDB & Taste Scores** to reduce external API latency by 80%.
- [ ] **pgvector Vector Database Integration** for fast sub-millisecond similarity queries across millions of embedding vectors.
- [ ] **LangChain RAG Pipeline Expansion** with FAISS index persistence for instant film trivia and metadata retrieval.
- [ ] **Automated End-to-End Testing Suite** (Playwright / Cypress) covering critical user flows.
- [ ] **Enhanced Watch Party Synchronized Video Playback Controls** (Play, Pause, Seek synchronization across viewers).

---

## 🔵 Planned (v0.3.0 Target)

- [ ] **Social Movie Clubs & Discussion Hubs**: Persistent community hubs around specific genres, directors, and film festivals.
- [ ] **Custom AI Movie Critic Persona Generator**: Choose from vintage film critics, comedic reviewers, or academic analysts.
- [ ] **Interactive Voice Movie Assistant**: Real-time voice query resolution and recommendation conversational UI.
- [ ] **Multi-Language AI Subtitle & Dubbing Metadata Lookup**: Global accessibility expansions.
- [ ] **Mobile App (React Native / Expo)** sharing the existing backend APIs and Prisma schema.

---

## 🟣 Future AI Features & Innovation Experiments

- [ ] **Generative Movie Teaser & Poster Art Synthesizer**: AI image generation for custom watchlist collections.
- [ ] **Predictive Box Office & Award Season AI Radar**: Machine learning model forecasting Oscar and Cannes contenders.
- [ ] **Autonomous LangGraph Script Analysis Agent**: Upload screenplay excerpts to generate visual tone recommendations.

---

## 🤝 Community Requests & Feedback

We prioritize features requested by community members! Check out our [GitHub Discussions](https://github.com/shouryapratap132006/cineverse/discussions) or submit a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml) to vote on upcoming features.
