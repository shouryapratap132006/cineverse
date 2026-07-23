# `prisma/` Directory Overview

This directory contains the **Prisma ORM 7** database schema, migration history, configuration, and seeding scripts for PostgreSQL.

## 📂 Contents

- **`schema.prisma`**: Comprehensive data model defining `User`, `TasteProfile`, `Watchlist`, `Review`, `WatchParty`, and `Subscription` models.
- **`migrations/`**: Chronological SQL migration history applied via Prisma Migrate.
- **`seed.ts`**: Database seed script populating initial sample movies, taste vectors, and genre taxonomies for local testing.

## 🛠️ Prisma CLI Workflows

```bash
# Generate Prisma Client types
npm run prisma:generate

# Apply pending migrations in development
npm run prisma:migrate

# Open visual Prisma Studio database manager
npm run prisma:studio

# Execute seed script
npm run seed
```
