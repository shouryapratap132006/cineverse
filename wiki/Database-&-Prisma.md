# Database & Prisma ORM

CineVerse uses Prisma 7 with PostgreSQL.

---

## 🗄️ Core Models
- `User`: Synced with Clerk authentication.
- `TasteProfile`: 5-dimensional preference metrics.
- `Watchlist` & `WatchlistItem`: User collections.
- `Review`: Community ratings & reviews.
- `WatchParty`: Real-time room metadata.
- `Subscription`: Stripe tier state.
