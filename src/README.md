# `src/` Directory Overview

The `src/` directory contains the core source code of **CineVerse**, built on Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## 📂 Subdirectory Architecture

| Folder | Purpose & Responsibilities | Key Dependencies |
| ------ | -------------------------- | ---------------- |
| [`actions/`](actions/README.md) | Next.js Server Actions for mutation operations (Auth sync, Watchlists, Reviews). | Prisma, Clerk Auth |
| [`ai/`](ai/README.md) | AI engine, Groq LLM gateway, LangGraph multi-agent orchestrator, taste profiling. | Groq SDK, Zod, LangChain |
| [`app/`](app/README.md) | Next.js App Router layout, pages, API routes, middleware. | Next.js 16, React 19 |
| [`components/`](components/README.md) | Reusable UI component design system (Carousels, Modals, Radar Charts). | Radix UI, Framer Motion, Lucide |
| [`hooks/`](hooks/README.md) | Custom React hooks for Socket.IO, media playback, theme, and data fetching. | React 19, Socket.IO Client |
| [`lib/`](lib/README.md) | Shared utilities, database client singleton, TMDB proxy client, formatters. | Prisma Client, Cloudinary, Stripe |

## 🛡️ Key Principles
- **Type Safety**: Full strict TypeScript annotations across all modules.
- **Server Component Separation**: Server components by default; `'use client'` strictly reserved for interactive components.
- **Decoupled Architecture**: Logic in `ai/` and `actions/` is independent of UI presentation components.
