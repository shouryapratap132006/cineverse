# `src/hooks/` Directory Overview

This directory contains custom **React 19 Custom Hooks** encapsulation stateful client logic, real-time WebSocket listeners, and browser APIs.

## 📂 Custom Hooks

- **`useSocket.ts`**: Manages client-side Socket.IO socket connections, event subscriptions, and room join/leave lifecycle.
- **`useTasteProfile.ts`**: Fetches, caches, and optimistic updates user Movie DNA taste vectors.
- **`useDebounce.ts`**: Debounces fast natural language search input before dispatching AI semantic queries.
- **`useWatchlist.ts`**: Manages user watchlist state, optimistic add/remove updates, and sync feedback.
- **`useMediaQuery.ts`**: Responsive breakpoint detection hook for mobile vs. desktop drawer states.
