# Help Wanted Issues Catalog (20 Medium-Level Engineering Tasks)

This catalog contains 20 medium-to-advanced issues seeking community contributions to optimize AI performance, database indexing, caching, and real-time scaling in **CineVerse**.

---

### Issue #1: Implement Redis Caching Layer for TMDB API Requests
- **Description**: Upstream TMDB API requests currently hit external endpoints on every cache miss. Implement a Redis caching layer (`ioredis`) with a 1-hour TTL.
- **Files Involved**: `src/lib/tmdb.ts`, `src/lib/redis.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2 - 3 hours
- **Suggested Solution**: Wrap `fetchTMDB()` with a Redis cache lookup checking key `tmdb:endpoint:query` before executing HTTP requests.
- **Labels**: `help wanted`, `performance`, `backend`

---

### Issue #2: Optimize Semantic Search Prompt Expansion Latency
- **Description**: Natural language search queries take ~1200ms to resolve Groq prompt expansions. Optimize system prompt tokens and switch to fast inference parameters.
- **Files Involved**: `src/ai/services/semanticSearch.service.ts`
- **Difficulty**: Medium
- **Estimated Time**: 1.5 - 2 hours
- **Suggested Solution**: Streamline JSON schema prompt, reduce max tokens to 150, and use `GROQ_FAST_MODEL` (`llama-3.1-8b-instant`).
- **Labels**: `help wanted`, `AI`, `performance`

---

### Issue #3: Refactor Recommendation Pipeline into Modular Worker Nodes
- **Description**: The hybrid recommendation engine runs sequentially. Refactor candidate fetching and vector scoring into parallel Promise pipelines.
- **Files Involved**: `src/ai/services/recommendation.service.ts`
- **Difficulty**: Medium
- **Estimated Time**: 3 hours
- **Suggested Solution**: Execute genre filtering, tempo matching, and mood scoring concurrently via `Promise.all()`.
- **Labels**: `help wanted`, `AI`, `backend`

---

### Issue #4: Improve Movie DNA Explanations with Groq Contextual Insights
- **Description**: Radar scores display numerical values without textual explanations of *why* a user's pacing score is 0.85. Add LLM summary generation.
- **Files Involved**: `src/ai/services/taste.service.ts`, `src/components/ai/MovieDNARadar.tsx`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Pass top 5 rated films to Groq to generate a 2-sentence breakdown of user cinematic taste attributes.
- **Labels**: `help wanted`, `AI`, `UX`

---

### Issue #5: Add Composite Database Indexes to Watchlist & Review Tables
- **Description**: Queries searching user reviews and watchlists perform full table scans under load. Add composite Prisma database indexes.
- **Files Involved**: `prisma/schema.prisma`
- **Difficulty**: Medium
- **Estimated Time**: 1 hour
- **Suggested Solution**: Add `@@index([userId, createdAt])` and `@@index([tmdbMovieId, rating])` attributes to Prisma models and generate migration.
- **Labels**: `help wanted`, `Prisma`, `performance`

---

### Issue #6: Optimize Socket.IO Heartbeat and Reconnection Backoff
- **Description**: Rapid WebSocket reconnect attempts during network blips create server connection spikes. Implement exponential backoff in Socket.IO client.
- **Files Involved**: `src/hooks/useSocket.ts`, `server.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Configure `reconnectionDelay` and `reconnectionDelayMax` in `io()` client setup.
- **Labels**: `help wanted`, `Socket.IO`, `performance`

---

### Issue #7: Implement pgvector Vector Similarity Lookup for Movie Embeddings
- **Description**: Replace in-memory cosine similarity calculation with PostgreSQL `pgvector` extension query execution.
- **Files Involved**: `prisma/schema.prisma`, `src/ai/services/taste.service.ts`
- **Difficulty**: Medium / Advanced
- **Estimated Time**: 4 hours
- **Suggested Solution**: Enable `pgvector` in PostgreSQL and query distance using `ORDER BY embedding <=> vector LIMIT 20`.
- **Labels**: `help wanted`, `RAG`, `Prisma`

---

### Issue #8: Implement Discover Page Dynamic Edge Caching
- **Description**: Popular discover carousels re-render on every request. Add Next.js `revalidateTag` caching wrappers.
- **Files Involved**: `src/app/(dashboard)/discover/page.tsx`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Wrap TMDB carousel fetches with `unstable_cache()` and 3600-second revalidation tags.
- **Labels**: `help wanted`, `performance`, `frontend`

---

### Issue #9: Add Rate-Limiting Middleware for AI Endpoints
- **Description**: Unauthenticated or free users can spam AI endpoints. Add sliding window rate-limiting middleware.
- **Files Involved**: `src/app/api/ai/route.ts`, `src/lib/ratelimit.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2.5 hours
- **Suggested Solution**: Implement token bucket algorithm tracking client IP / Clerk user ID.
- **Labels**: `help wanted`, `security`, `backend`

---

### Issue #10: Implement Infinite Scroll for Large Movie Catalogs
- **Description**: The movie discovery page relies on standard pagination buttons. Replace with smooth infinite scrolling.
- **Files Involved**: `src/app/(dashboard)/discover/page.tsx`, `src/hooks/useInfiniteScroll.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2.5 hours
- **Suggested Solution**: Use `IntersectionObserver` to trigger page fetch when scrolling near footer.
- **Labels**: `help wanted`, `frontend`, `UX`

---

### Issue #11: Add Automated Playwright E2E Test Suite for Watch Party Flow
- **Description**: We lack automated browser tests for watch party creation and chat sending. Add Playwright test scripts.
- **Files Involved**: `tests/e2e/watchparty.spec.ts`
- **Difficulty**: Medium
- **Estimated Time**: 3 hours
- **Suggested Solution**: Write Playwright test simulating two browser contexts joining the same room.
- **Labels**: `help wanted`, `testing`, `Socket.IO`

---

### Issue #12: Optimize Bundle Size by Dynamic Importing Heavy Libraries
- **Description**: Initial JS bundle includes `emoji-mart` and `framer-motion` on pages where they aren't immediately visible.
- **Files Involved**: `src/components/watchparty/ChatRoom.tsx`, `src/components/ai/MovieDNARadar.tsx`
- **Difficulty**: Medium
- **Estimated Time**: 1.5 hours
- **Suggested Solution**: Use `next/dynamic` with `ssr: false` for heavy component modals.
- **Labels**: `help wanted`, `performance`, `frontend`

---

### Issue #13: Implement Stripe Webhook Idempotency Check
- **Description**: Duplicate Stripe webhook events could trigger duplicate subscription updates. Implement event ID tracking in DB.
- **Files Involved**: `src/app/api/webhooks/stripe/route.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Record processed `eventId` strings in a `ProcessedWebhook` table to ensure idempotency.
- **Labels**: `help wanted`, `Stripe`, `security`

---

### Issue #14: Add Virtualized List Rendering for Long Chat Messages
- **Description**: Watch party rooms with 500+ messages experience DOM lag. Implement list virtualization.
- **Files Involved**: `src/components/watchparty/ChatRoom.tsx`
- **Difficulty**: Medium
- **Estimated Time**: 2.5 hours
- **Suggested Solution**: Integrate `@tanstack/react-virtual` for message list rendering.
- **Labels**: `help wanted`, `performance`, `frontend`

---

### Issue #15: Enhance LangGraph Multi-Turn Memory Persistence
- **Description**: Conversational AI assistant loses context across page navigations. Persist graph state in PostgreSQL.
- **Files Involved**: `src/ai/orchestrator.ts`
- **Difficulty**: Medium / Advanced
- **Estimated Time**: 3.5 hours
- **Suggested Solution**: Configure LangGraph `PostgresSaver` checkpointer for session state recovery.
- **Labels**: `help wanted`, `LangGraph`, `AI`

---

### Issue #16: Add Image Optimization Pipeline for User Cloudinary Avatars
- **Description**: Avatars uploaded via Cloudinary are stored without size compression limits. Implement transform parameters.
- **Files Involved**: `src/lib/cloudinary.ts`
- **Difficulty**: Medium
- **Estimated Time**: 1.5 hours
- **Suggested Solution**: Enforce `c_fill,w_300,h_300,q_auto,f_auto` transformation parameters on upload URLs.
- **Labels**: `help wanted`, `backend`, `performance`

---

### Issue #17: Add Automated Database Backup Cron Script
- **Description**: Add automated script to export PostgreSQL database dumps to S3 / local storage.
- **Files Involved**: `scripts/db-backup.sh`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Write `pg_dump` wrapper script with GZIP compression and rotation policy.
- **Labels**: `help wanted`, `AWS`, `Prisma`

---

### Issue #18: Implement Dark/Light Mode Theme Toggle System
- **Description**: Currently the application is locked to Dark Mode. Add seamless Light / Dark theme switching with Tailwind variables.
- **Files Involved**: `src/app/globals.css`, `src/components/layout/Navbar.tsx`
- **Difficulty**: Medium
- **Estimated Time**: 2.5 hours
- **Suggested Solution**: Integrate `next-themes` provider and update root background classes.
- **Labels**: `help wanted`, `frontend`, `UX`

---

### Issue #19: Add Structured Logging & Distributed Tracing
- **Description**: Replace raw console messages with a structured JSON logger supporting log levels (`info`, `warn`, `error`).
- **Files Involved**: `src/lib/logger.ts`
- **Difficulty**: Medium
- **Estimated Time**: 2 hours
- **Suggested Solution**: Create lightweight Pino logger wrapper formatted for production log aggregators.
- **Labels**: `help wanted`, `backend`, `documentation`

---

### Issue #20: Implement Multi-Language Localization (i18n) Foundation
- **Description**: Prepare CineVerse for internationalization with i18n translation dictionary support.
- **Files Involved**: `src/lib/i18n.ts`, `public/locales/`
- **Difficulty**: Medium
- **Estimated Time**: 3 hours
- **Suggested Solution**: Integrate `next-intl` dictionary routing for English and Spanish locales.
- **Labels**: `help wanted`, `frontend`, `UX`
