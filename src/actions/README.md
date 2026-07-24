# `src/actions/` Directory Overview

This directory contains Next.js **Server Actions** (`'use server'`) that execute server-side mutations directly from React client components without requiring manual boilerplate API endpoints.

## 📂 Key Files & Responsibilities

- **`user.actions.ts`**: Clerk authentication webhook handler, user database record initialization, taste vector updates.
- **`watchlist.actions.ts`**: Creating, modifying, deleting watchlists, toggling movie saved states.
- **`review.actions.ts`**: Submitting movie reviews, star ratings, and triggering AI content moderation checks.
- **`watchparty.actions.ts`**: Creating watch party rooms, managing invite codes, and updating host state.

## 🔒 Security & Data Integrity
- All server actions authenticate the active user session via `@clerk/nextjs/server` `auth()`.
- Data payloads are validated using **Zod** schemas before DB persistence.
- Exceptions are caught and formatted into standard response objects (`{ success: boolean, data?: T, error?: string }`).
