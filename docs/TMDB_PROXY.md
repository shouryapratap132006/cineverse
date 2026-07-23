# TMDB API Proxy & Caching Layer

CineVerse wraps the TMDB (The Movie Database) API v3 to optimize network overhead, manage API keys server-side, and implement in-memory cache responses.

---

## ⚡ Key Features

- **Key Encapsulation**: TMDB API key is kept server-side; clients query `/api/tmdb/*`.
- **Response Caching**: Frequently requested trending lists and movie detail metadata are cached with standard HTTP `Cache-Control` headers.
- **Fallback Data**: In the event of upstream TMDB API downtime, fallback mock responses ensure the UI remains functional.
