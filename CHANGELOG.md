# Changelog

All notable changes to the **CineVerse** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-23

### Added
- **Production Open-Source Readiness Architecture**: Complete governance structure including `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `ROADMAP.md`, `LICENSE` (MIT), and `docs/` technical reference specs.
- **Automated Issue & PR Templates**: Form-based GitHub issue templates for Bug Reports, Feature Requests, Documentation, AI Improvements, and Performance Issues.
- **Comprehensive Technical Documentation Hub**: Detailed specifications for Architecture, Clerk Authentication Flow, Hybrid Recommendation Engine, Movie DNA, Semantic Search, LangGraph Workflow, RAG Pipeline, Docker, AWS Deployment, Prisma Database Schema, Socket.IO, and Stripe.
- **Subdirectory README System**: Modular `README.md` files across all core folders (`src/`, `src/actions/`, `src/ai/`, `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `prisma/`, `scripts/`, `.github/`).
- **50 Pre-Populated Open-Source Issues**: Cataloged 30 Good First Issues and 20 Help Wanted Issues with complete execution specs.
- **Enhanced `package.json` Developer Scripts**: Added `format`, `typecheck`, `test`, `docker`, `prisma:generate`, `prisma:migrate`, `prisma:studio`, and `seed` tasks.
- **GitHub Pages & Wiki Integration**: Pre-configured static site setup in `docs/` and markdown wiki modules in `wiki/`.

### Tech Stack
- Next.js 16.2 (App Router, Server Actions) & React 19.2
- Tailwind CSS v4 & Framer Motion 12
- Groq AI SDK & LangGraph Agent Engine
- Prisma ORM 7 with PostgreSQL (Neon / AWS RDS)
- Clerk Authentication
- Socket.IO & Pusher real-time communication
- Cloudinary asset CDN & Stripe subscription billing
