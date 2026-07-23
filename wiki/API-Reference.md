# API Reference

CineVerse API endpoints and Server Actions specification.

---

## 🔌 Webhooks & REST Endpoints
- `POST /api/webhooks/clerk`: Clerk user identity events.
- `POST /api/webhooks/stripe`: Stripe subscription webhook updates.
- `GET /api/tmdb/[...path]`: Cached TMDB proxy client.
- `POST /api/ai/recommend`: Streaming recommendation generator.
- `POST /api/ai/chat`: Multi-agent conversation stream.
