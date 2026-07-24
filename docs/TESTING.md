# Comprehensive Testing Strategy

This guide documents how to execute unit tests, inspect Docker builds, test AI services, and verify real-time Socket.IO communication.

---

## 🧪 1. Local Code Quality & Type Tests

```bash
# Verify TypeScript compile-time correctness
npm run typecheck

# Check ESLint rule compliance
npm run lint

# Run Node.js native test runner
npm run test
```

---

## 🐋 2. Testing Local Docker Containers

```bash
# Build production multi-stage image
npm run docker:build

# Launch stack locally
npm run docker:up

# Verify healthy status
docker ps
```

---

## 🤖 3. Testing AI Endpoints & Fallback Gateways

- Set `AI_PROVIDER=groq` in `.env`.
- Run `npx ts-node src/ai/services/recommendation.service.ts` to test output validation against Zod schemas.

---

## 📡 4. Testing WebSockets (Socket.IO)

- Launch `npm run dev`.
- Open two separate browser windows (or incognito) to `/watch-party/[roomId]`.
- Trigger playback pause/play and verify event sync across both windows.
