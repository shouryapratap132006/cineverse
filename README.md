# 🎬 CineVerse

> **The social network for cinephiles** — powered by AI, real-time collaboration, and the full TMDB database.

CineVerse is a full-stack, production-grade web application that blends the best of Letterboxd, Reddit, and an AI film critic into one premium dark-mode platform. Users can discover movies, track what they've watched, post reviews, react to each other's content, join themed film communities, message friends in real time, and interact with a suite of AI features — all backed by a live TMDB integration.

---

## ✨ Feature Overview

### 🏠 Dashboard & Feed
- **Social Feed** with toggleable **Following** and **Trending** modes
  - *Following* — shows posts only from users you follow (+ your own)
  - *Trending* — globally sorted by most reactions
- **Trending Cinema Carousel** — horizontal scroll of top movies from TMDB with ratings
- **Post composer** — create text, image, movie-tagged, review, or poll posts
- **Post Cards** with emoji reactions (❤️ 🔥 🎬 😂 😲 😭 👏), comments, bookmarks, reposts, and a functioning three-dot context menu (Copy Link, Share, Report)

### 👤 Profile Page
Full cinephile identity system:

| Tab | Content |
|-----|---------|
| **Cinema** | Top 5 Favourite Films picker + Recently Watched grid |
| **Activity** | Chronological activity stream |
| **Posts** | All posts you've published |
| **Reviews** | All movie reviews with ratings |
| **Liked** | Posts you've reacted to |
| **Commented** | Posts you've commented on |
| **Saved** | Bookmarked posts |
| **Taste** | AI-generated Movie DNA / genre taste profile |

- **Top 5 Favourite Films** — live TMDB search picker. Click any slot, search, pick, save. Publicly visible to everyone.
- **Recently Watched** — poster grid pulled from your diary entries
- **Edit Profile** modal — username, bio, avatar (from actor photo gallery), banner, language, country, favorite genres
- **Stats** — Followers, Following, Reviews, Posts, Watched count, Liked count

### 🎥 Movie Pages (`/dashboard/movies/[id]`)
- Full TMDB movie details: synopsis, cast, crew, genres, runtime, release date
- User reviews with star ratings and spoiler tagging
- Add to Watchlist / Mark as Watched
- Share to Feed

### 🔍 Discover & Search (`/dashboard/discover`, `/dashboard/search`)
- Browse movies by genre, popularity, or new releases
- Real-time TMDB search with debouncing
- AI semantic search (optional)

### 📋 Watchlist (`/dashboard/watchlist`)
- **Want to Watch** and **Watched** queues
- Mark individual movies as watched
- Remove movies from lists
- Track watch history across your diary

### ✍️ Reviews (`/dashboard/reviews`)
- Write long-form reviews (text editor)
- Rating out of 10
- Spoiler flag, visibility settings (Public / Friends / Private)
- Rewatch flag
- Comments and reactions on reviews

### 📔 Film Diary
- Log every viewing with date, rating, notes
- Rewatch flag
- Powers the "Recently Watched" section on your profile

### 📝 Curated Lists
- Create ranked or unranked public/private lists
- Add movies via TMDB search
- Share lists to your feed

### 👥 Social Graph
- **Follow / Unfollow** users
- **Friend Requests** (PENDING → ACCEPTED / REJECTED)
- **Suggested Users** in the sidebar
- Follower / Following counts on profiles

### 💬 Messages (`/dashboard/messages`)
- Real-time direct messaging powered by **Socket.IO** and **Pusher**
- 1-on-1 and group conversations
- Message seen receipts
- Pin messages
- WhatsApp-style UI with conversation list sidebar

### 🏘️ Communities (`/dashboard/community`)
- Browse and join film communities (movie-specific, genre-specific, user-created)
- Community types: MOVIE, GENRE, STUDIO, ACTOR, DIRECTOR, USER_CREATED
- Role system: OWNER, ADMIN, MODERATOR, VERIFIED_CREATOR, MEMBER, MUTED, BANNED
- Community rules, events, pinned posts
- **Events** with RSVP (Going / Interested / Not Going)
- **AI Companion** in community sidebar — ask anything about films relevant to that community, get a real AI response with TMDB poster and link

### 🎞️ Film Clubs
- Private or public group watches
- Club members share a watchlist of movies
- Owner and member roles

### 🔔 Notifications
- Real-time notifications for: Likes, Comments, Replies, Mentions, Friend Requests, Accepted Requests, Messages, Community Invites
- Mark as read / unread
- Notification bell with unread count badge

### 📖 Stories
- Ephemeral movie-tagged stories

### 🏆 Achievements & Badges
- Badge system with earned achievements
- Reputation levels (Bronze Star, etc.)

---

## 🤖 AI Features (`/dashboard/ai`)

CineVerse has a full AI layer powered by **Groq** (`llama-3.3-70b-versatile`) and a custom AI orchestrator with retry logic, caching, and provider swapping:

### 🗣️ AI Companion (Sidebar — always available)
Available on every page in the right sidebar and on community pages. Ask anything and get:
- A real AI-generated movie recommendation with reasoning
- Live TMDB poster, rating, and release year
- Topic tags (e.g. `mind-bending`, `atmospheric`, `feel-good`)
- Direct link to the movie's detail page

### 💬 AI Chat (`/dashboard/ai/chat`)
Full persistent conversation history with the CineVerse AI movie companion:
- Multi-turn conversations with streaming responses (Server-Sent Events)
- Movie-context mode (chat about a specific movie)
- History stored in database (`AIConversation` / `AIMessage` tables)
- Conversation folders and pinning

### 📅 Daily Pick (`/dashboard/ai/daily`)
AI-curated personalised "Movie of the Day" based on your taste profile, watch history, and favourite genres.

### 🧬 Movie DNA (`/dashboard/ai/dna`)
Analyses your reviews, diary, watchlist, and favourites to generate a **Cinematic DNA** profile:
- Genre percentage breakdown (visual chart)
- Directors / actors / themes inferred from your history
- Taste personality archetype (e.g. "The Cerebral Auteur Fan")
- Pacing preference and favourite decade

### 🎓 Film Professor (`/dashboard/ai/professor`)
Deep-dive AI analysis of any movie:
- Themes and symbolism
- Cinematographic style breakdown
- Director's recurring motifs
- Narrative structure analysis
- Ending / twist explanation

### 🔭 Knowledge Graph
Visual connection graph between movies, directors, actors, and genres — AI-generated and cached.

### 🔎 AI Search (`/dashboard/ai/search`)
Semantic search — describe a feeling or concept ("a movie about loneliness in a big city") and get matching film recommendations.

### 📋 AI Watchlist Builder (`/dashboard/ai/watchlist`)
Describe a theme, mood, or prompt and the AI generates a complete watchlist of 5–10 films with per-film reasoning. Save the generated list directly to your watchlist with one click.

### 🎬 Scene Analysis
AI deep-dives into specific scenes: cinematography, symbolism, direction, and emotional impact.

### 📝 AI Review Helper
AI assists in writing a review — suggests insights, themes, and comparisons to help structure your critique.

### 🛡️ AI Content Moderation
AI-powered community moderation to detect harmful content in posts and comments.

### 📊 Community AI Summary
Generates daily/weekly AI summaries of community activity, top discussions, and trending topics within a community.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL via Prisma ORM 7 |
| **Auth** | Clerk (with cookie-based fallback for dev) |
| **AI Provider** | Groq — `llama-3.3-70b-versatile` |
| **Real-time** | Socket.IO + Pusher |
| **Movie Data** | TMDB API v3 |
| **Image Upload** | Cloudinary |
| **State Management** | React 19 + TanStack Query v5 |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form + Zod |
| **Icons** | Lucide React |
| **Emoji Picker** | emoji-mart |
| **Date Utilities** | date-fns |

---

## 🗄️ Database Schema

**34 Prisma models** across two logical layers:

**Core Social**
```
User  Profile  Movie  Watchlist  Favorite  Review  DiaryEntry
CineverseList  ListEntry  Post  Comment  Like  Reaction  Follow
FriendRequest  Bookmark  Report  Notification  Activity
Badge  Achievement  Story
```

**Communities & Clubs**
```
Community  CommunityMember  CommunityPost  Poll  Vote
Event  EventRSVP  FilmClub  FilmClubMember  FilmClubMovie
Conversation  Message
```

**AI Layer**
```
AIConversation  AIMessage  TasteProfile  RecommendationHistory
GeneratedWatchlist  CommunitySummary  PromptTemplate  SceneAnalysis
KnowledgeGraphCache  MovieInsight  AIUsage
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database
- API keys for: TMDB, Clerk, Groq, Cloudinary, Pusher

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cineverse.git
cd cineverse
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cineverse"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# TMDB
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# AI (Groq)
GROQ_API_KEY=gsk_...
AI_PROVIDER=groq
GROQ_MODEL=llama-3.3-70b-versatile

# Real-time (Pusher)
PUSHER_APP_ID=...
PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# Image Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

### 4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
cineverse/
├── prisma/
│   └── schema.prisma           # 34-model database schema
├── src/
│   ├── app/
│   │   ├── api/ai/             # 14 AI API route handlers
│   │   │   ├── companion/      # General-purpose AI companion
│   │   │   ├── chat/           # Streaming movie chat
│   │   │   ├── daily/          # Daily movie pick
│   │   │   ├── recommend/      # Personalised recommendations
│   │   │   ├── watchlist/      # AI watchlist builder
│   │   │   ├── film-professor/ # Deep movie analysis
│   │   │   ├── knowledge-graph/# Movie connection graph
│   │   │   ├── search/         # Semantic search
│   │   │   ├── scene/          # Scene analysis
│   │   │   ├── review/         # AI review assistant
│   │   │   ├── moderation/     # Content moderation
│   │   │   ├── community/      # Community AI summaries
│   │   │   ├── profile/        # Movie DNA generation
│   │   │   └── conversations/  # Chat history management
│   │   ├── auth/               # Sign-in / Sign-up pages
│   │   ├── onboarding/         # New user onboarding
│   │   └── dashboard/
│   │       ├── page.tsx        # Main social feed
│   │       ├── ai/             # All AI feature pages
│   │       ├── community/      # Community pages & events
│   │       ├── discover/       # Browse movies
│   │       ├── messages/       # Real-time chat UI
│   │       ├── movies/[id]/    # Movie detail pages
│   │       ├── post/[id]/      # Single post view
│   │       ├── profile/        # Own profile page
│   │       ├── reviews/        # Review browser
│   │       ├── search/         # Search
│   │       └── watchlist/      # Watchlist manager
│   ├── actions/                # 13 Next.js Server Actions
│   │   ├── social.ts           # Feed, posts, reactions, comments
│   │   ├── profile.ts          # User profile + activity
│   │   ├── user.ts             # Account management
│   │   ├── watchlist.ts        # Watchlist CRUD
│   │   ├── review.ts           # Reviews CRUD
│   │   ├── diary.ts            # Film diary
│   │   ├── lists.ts            # Curated lists
│   │   ├── community.ts        # Communities + events
│   │   ├── messages.ts         # Conversations + messages
│   │   ├── friends.ts          # Follow / friend requests
│   │   ├── notifications.ts    # Notification system
│   │   ├── search.ts           # Search
│   │   └── upload.ts           # Cloudinary uploads
│   ├── ai/
│   │   ├── orchestrator.ts     # Retry + caching layer
│   │   ├── gateway.ts          # AI provider factory (swap Groq/OpenAI/Claude)
│   │   ├── providers/
│   │   │   └── groq.provider.ts
│   │   ├── services/           # Domain-specific AI services
│   │   ├── prompts/            # System prompt templates
│   │   └── utils/cache.ts      # In-memory TTL cache
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx     # Left navigation
│   │   │   └── RightSidebar.tsx# AI companion + release calendar + suggestions
│   │   ├── social/
│   │   │   ├── PostCard.tsx    # Full post component with reactions + menu
│   │   │   └── PostComposer.tsx
│   │   ├── ai/                 # All AI UI components
│   │   └── shared/             # GlassCard, skeletons, etc.
│   ├── lib/
│   │   ├── db.ts               # Prisma client singleton
│   │   └── avatars.ts          # Actor avatar gallery
│   └── middleware.ts           # Clerk auth + route protection
└── server.ts                   # Custom Next.js + Socket.IO server
```

---

## 🔌 AI API Reference

All AI endpoints live under `/api/ai/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/companion` | `POST` | General AI companion — returns movie + reasoning + TMDB data |
| `/api/ai/chat` | `POST` | Streaming movie chat (SSE) |
| `/api/ai/chat` | `GET` | Get suggested conversation prompts |
| `/api/ai/daily` | `GET` | Today's personalised movie pick |
| `/api/ai/recommend` | `POST` | Personalised recommendations by type |
| `/api/ai/watchlist` | `POST` | Generate watchlist from prompt |
| `/api/ai/film-professor` | `POST` | Deep movie analysis |
| `/api/ai/knowledge-graph` | `POST` | Movie knowledge graph |
| `/api/ai/search` | `POST` | Semantic AI search |
| `/api/ai/scene` | `POST` | Scene-level analysis |
| `/api/ai/review` | `POST` | AI review writing assistant |
| `/api/ai/moderation` | `POST` | Content moderation |
| `/api/ai/community` | `POST` | Community AI summary |
| `/api/ai/profile` | `GET` | Generate Movie DNA |
| `/api/ai/conversations` | `GET/POST/DELETE` | Chat history management |

---

## 🎨 Design System

- **Dark-first** premium glassmorphism aesthetic
- **Color Palette**: Deep slate backgrounds, brand blue/purple gradients (`from-brand-blue to-brand-purple`), gold star accents (`brand-gold`)
- **Typography**: Display font for headings, clean system sans-serif for body text
- **Animations**: Framer Motion page transitions, CSS `animate-in` micro-animations, hover scale effects
- **Components**: `GlassCard` base component with optional glow, custom `no-scrollbar` utilities, pill badges

---

## 🔐 Authentication

CineVerse uses **Clerk** for production authentication with a built-in development fallback:

- **Production**: Full Clerk session management, JWT tokens, OAuth providers
- **Development fallback**: Cookie-based mock session (`cineverse_session`) if no Clerk keys are present
- **Protected routes**: `/dashboard/*` and `/onboarding` require authentication via middleware
- **Graceful fallback**: Middleware catches Clerk errors and falls back to cookie-based auth, preventing crashes

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ for cinephiles everywhere</p>
