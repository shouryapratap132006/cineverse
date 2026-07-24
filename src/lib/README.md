# `src/lib/` Directory Overview

The `src/lib/` directory provides core infrastructure singletons, external SDK wrappers, database connections, and shared utility helpers.

## 📂 Key Modules & Files

- **`prisma.ts`**: Prisma Client 7 database connection singleton preventing connection exhaustion during Next.js hot reloads.
- **`tmdb.ts`**: TMDB API v3 wrapper handling caching, request retries, and data formatting.
- **`cloudinary.ts`**: Cloudinary SDK client setup for image upload signing and avatar transformations.
- **`stripe.ts`**: Stripe SDK client instance for subscription checkout session generation.
- **`utils.ts`**: Universal helper functions (`cn()`, date formatters, currency formatters, percentage calculators).
