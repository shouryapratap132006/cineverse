# `src/app/` Directory Overview

This directory contains the **Next.js 16 App Router** page hierarchy, layouts, middleware, and API routes.

## 📂 Route Map

- `(auth)/`: Authentication pages (`/sign-in`, `/sign-up`, `/onboarding`) using Clerk components.
- `(dashboard)/`: Primary application pages (`/dashboard`, `/discover`, `/movie/[id]`, `/movie-dna`, `/watch-party`).
- `api/`: REST API endpoints:
  - `api/webhooks/clerk`: Clerk user identity events.
  - `api/webhooks/stripe`: Stripe subscription webhook updates.
  - `api/tmdb/[...path]`: Edge-cached proxy routes for TMDB metadata.
  - `api/ai/`: AI recommendation & conversational query streaming.
- `layout.tsx`: Root layout initializing React Query client, Clerk provider, and global theme context.
- `globals.css`: Tailwind CSS v4 directives and CSS variable definitions.

## 🌐 Middleware & Guardrails
- `middleware.ts`: Clerk route guard protecting private dashboard routes while leaving public TMDB assets and webhooks accessible.
