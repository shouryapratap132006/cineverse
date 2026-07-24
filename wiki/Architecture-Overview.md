# Architecture Overview

CineVerse is built on a modular Next.js 16 + Express hybrid server setup.

---

## 🏗️ Architectural Layers

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion.
- **Server Execution**: Node.js HTTP server (`server.ts`) running custom Express routes and Socket.IO.
- **AI Intelligence**: Groq LLaMA 3.3 70B LLM, LangGraph state machine, Zod schema validation.
- **Database**: PostgreSQL (Neon / AWS RDS) via Prisma ORM 7.
- **Media & Sync**: Cloudinary CDN assets, Stripe subscription billing, Pusher / Socket.IO.
