# Code Quality & Refactoring Standards

This document outlines architectural recommendations to improve maintainability, error handling, typing, and performance without breaking existing functionality.

---

## 🧹 Key Guidelines

1. **Folder Organization**: Maintain strict component boundary division (`src/components/ui`, `src/components/movie`, `src/components/ai`).
2. **Explicit Typing**: Avoid `any` in TypeScript. Utilize Prisma generated types (`import { User } from '@prisma/client'`).
3. **Structured Error Handling**: Server actions must wrap database or external API calls in `try/catch` blocks returning consistent response payloads.
4. **Console & Logging**: Use structured logger helpers instead of raw `console.log` statements in production routes.
5. **Dynamic Component Loading**: Use `next/dynamic` for heavy client components (e.g. Framer Motion Radar, Video Player).
