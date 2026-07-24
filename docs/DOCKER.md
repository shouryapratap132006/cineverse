# Docker Containerization Specification

CineVerse uses a multi-stage Docker build to optimize production image size and security.

---

## 🐋 Multi-Stage `Dockerfile` Analysis

- **Stage 1 (`deps`)**: Installs production & dev dependencies.
- **Stage 2 (`builder`)**: Generates Prisma client types and builds Next.js production bundle.
- **Stage 3 (`runner`)**: Lightweight Alpine runtime containing only production assets. Runs as non-root user `nextjs`.

```dockerfile
# Production Runner Excerpt
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🎛️ Docker Compose Files

- **`docker-compose.yml`**: Local development orchestration (App + PostgreSQL container).
- **`docker-compose.ghcr.yml`**: Production orchestration pulling pre-built GHCR images.
