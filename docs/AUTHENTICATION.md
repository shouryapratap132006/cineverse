# Authentication & User Synchronization Flow

CineVerse uses **Clerk Authentication** for enterprise-grade security, supporting social logins (Google, GitHub), magic links, and passkeys, tightly synced with our **Prisma PostgreSQL** database via webhooks.

---

## 🔁 Authentication Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as Next.js Client
    participant Clerk as Clerk Auth Service
    participant Webhook as API Webhook (/api/webhooks/clerk)
    participant DB as Prisma PostgreSQL

    User->>App: Click 'Sign Up' / 'Sign In'
    App->>Clerk: Redirect to Clerk Managed UI
    User->>Clerk: Enter credentials / Social Auth
    Clerk-->>App: Return JWT Session Token
    Clerk->>Webhook: Trigger `user.created` / `user.updated` Event (Svix Signed)
    Webhook->>Webhook: Verify Svix Signature (CLERK_WEBHOOK_SECRET)
    Webhook->>DB: Upsert User Record & Default Taste Profile
    DB-->>Webhook: Return DB User Object
    App->>DB: Fetch Authenticated Dashboard State
    App-->>User: Render Personalized Dashboard
```

---

## 🛡️ Route Protection Middleware (`src/middleware.ts`)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/api/webhooks(.*)',
  '/api/tmdb(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

---

## 🔄 User Identity Synchronization
When a user registers or updates their profile via Clerk:
1. Clerk emits a webhook payload signed with a Svix header.
2. `/api/webhooks/clerk` validates the Svix signature using `CLERK_WEBHOOK_SECRET`.
3. An upsert query creates or updates the `User` record in PostgreSQL and initializes a blank `TasteProfile` vector.
