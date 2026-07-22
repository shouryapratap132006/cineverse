# syntax=docker/dockerfile:1

# ---- Base image ----
FROM node:22-alpine AS base
# libc6-compat + openssl keep Prisma/Next native bits happy on Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- Install ALL deps (needed to build) ----
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---- Build Next.js + compile the custom Socket.IO server ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so they
# must be passed as build args (compose reads them from ./.env — see docker-compose.yml).
# These are public values, safe to bake into the image.
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_PUSHER_KEY
ARG NEXT_PUBLIC_PUSHER_CLUSTER
ARG NEXT_PUBLIC_TMDB_API_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
    NEXT_PUBLIC_PUSHER_KEY=$NEXT_PUBLIC_PUSHER_KEY \
    NEXT_PUBLIC_PUSHER_CLUSTER=$NEXT_PUBLIC_PUSHER_CLUSTER \
    NEXT_PUBLIC_TMDB_API_KEY=$NEXT_PUBLIC_TMDB_API_KEY

# DATABASE_URL is only needed here if `next build` statically renders pages that hit the DB.
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Generate the Prisma client
RUN npx prisma generate
# Build the Next.js app
RUN npm run build
# Compile server.ts -> .server-out/server.js so the runtime needs plain node (no ts-node)
RUN npx tsc --project tsconfig.server.json

# ---- Lightweight migration image (Prisma CLI only; skips the heavy Next build) ----
FROM base AS migrator
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# NOTE: do NOT run `prisma generate` here. It loads prisma.config.ts, which requires
# DATABASE_URL at load time — that var isn't available at build time, so it crashes the
# build (PrismaConfigEnvError). `migrate deploy` doesn't need the generated client anyway;
# DATABASE_URL is provided at runtime via docker-compose env_file.
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- Install PRODUCTION deps only (drops ts-node, typescript, eslint, tailwind, @types, prisma CLI...) ----
FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev
# The generated Prisma client is created by the CLI (a devDep), so copy it over
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# ---- Final runtime image ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
# Cap the V8 heap so the app fits a 1 GB instance (override via .env if you resize up).
ENV NODE_OPTIONS=--max-old-space-size=512

# Run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Only the artifacts required to run
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/.next        ./.next
COPY --from=builder   /app/public       ./public
COPY --from=builder   /app/.server-out  ./.server-out
COPY --from=builder   /app/next.config.ts ./next.config.ts
COPY package.json ./

USER nextjs
EXPOSE 3000
CMD ["node", ".server-out/server.js"]
