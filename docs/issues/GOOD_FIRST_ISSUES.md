# Good First Issues Catalog (30 Beginner-Friendly Tasks)

This catalog contains 30 beginner-friendly open-source issues designed for first-time contributors to **CineVerse**.

---

### Issue #1: Add Loading Skeleton to Movie Card Component
- **Description**: Currently, movie cards display a blank grey box while posters load. Add a smooth animated shimmer skeleton placeholder.
- **Files Involved**: `src/components/movie/MovieCard.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 - 45 mins
- **Suggested Solution**: Add a Tailwind `animate-pulse` skeleton wrapper that renders until `onLoad` fires on the image tag.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #2: Display Release Year Badge on Movie Detail Header
- **Description**: The movie detail header shows the title and rating, but lacks the release year.
- **Files Involved**: `src/components/movie/MovieHeader.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Parse `release_date` with `date-fns` format `yyyy` and display a small pill badge.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #3: Format Runtime in Hours and Minutes
- **Description**: Movie runtime is displayed as total minutes (e.g. `142 min`). Convert it to `2h 22m` format.
- **Files Involved**: `src/lib/utils.ts`, `src/components/movie/MovieInfo.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Add `formatRuntime(minutes: number): string` helper in `src/lib/utils.ts`.
- **Labels**: `good first issue`, `frontend`, `documentation`

---

### Issue #4: Add Tooltip to Movie DNA Radar Chart Metrics
- **Description**: Users hovering over radar chart axes should see explanatory tooltips defining "Tempo" or "Narrative Complexity".
- **Files Involved**: `src/components/ai/MovieDNARadar.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 45 mins
- **Suggested Solution**: Integrate `@radix-ui/react-tooltip` wrapper over axis label text nodes.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #5: Add Keyboard Shortcut (Cmd+K / Ctrl+K) to Open Search Drawer
- **Description**: Allow power users to press `Cmd+K` anywhere on the dashboard to open the natural language search modal.
- **Files Involved**: `src/components/layout/Navbar.tsx`, `src/hooks/useKeyPress.ts`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Add a global `keydown` event listener checking for `metaKey || ctrlKey` and `k`.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #6: Add Empty Watchlist State Illustration
- **Description**: Show a helpful illustration and "Discover Movies" button when a user's watchlist is empty.
- **Files Involved**: `src/app/(dashboard)/watchlist/page.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Render a custom empty state component when `watchlist.length === 0`.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #7: Add Copy Room Code Button in Watch Party Lounge
- **Description**: Add a one-click "Copy Code" button next to the Watch Party invite code with toast feedback.
- **Files Involved**: `src/components/watchparty/PartyHeader.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 25 mins
- **Suggested Solution**: Use `navigator.clipboard.writeText()` and toggle a temporary check icon.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #8: Standardize Toast Notification Animations
- **Description**: Toast popups dismiss abruptly. Add smooth exit transitions.
- **Files Involved**: `src/components/ui/Toast.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Use Framer Motion `AnimatePresence` with `opacity: 0, y: 10`.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #9: Fix Truncated Director Name on Small Mobile Screens
- **Description**: On 320px mobile screens, long director names overflow the card container.
- **Files Involved**: `src/components/movie/MovieCard.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Add Tailwind `truncate max-w-[150px]` class to the director span.
- **Labels**: `good first issue`, `frontend`, `bug`

---

### Issue #10: Add Character Counter to Review Submission Textarea
- **Description**: Show `0 / 500 characters` below the review text input area.
- **Files Involved**: `src/components/movie/ReviewForm.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 25 mins
- **Suggested Solution**: Track input length in React state and display dynamic counter text.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #11: Add Genre Filter Pills to Discover Carousel
- **Description**: Allow quick genre filtering directly on the discover page header.
- **Files Involved**: `src/app/(dashboard)/discover/page.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 45 mins
- **Suggested Solution**: Add a horizontal scrollable row of genre toggle buttons updating search params.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #12: Improve Dark Mode Contrast on Secondary Badges
- **Description**: Secondary text badges have low contrast ratio on dark backgrounds.
- **Files Involved**: `src/components/ui/Badge.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Adjust Tailwind color classes to `text-slate-300 bg-slate-800/80`.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #13: Add Clear Input Button to Search Input
- **Description**: Add an 'X' icon button inside the search input when text is typed to quickly clear search.
- **Files Involved**: `src/components/ui/Input.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Render a Lucide `X` icon button conditionally when `value.length > 0`.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #14: Add Star Rating Summary Bar Chart
- **Description**: Display a breakdown bar chart (5-star, 4-star, etc.) on movie detail pages.
- **Files Involved**: `src/components/movie/RatingSummary.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 45 mins
- **Suggested Solution**: Calculate rating counts and render percentage width progress bars.
- **Labels**: `good first issue`, `frontend`, `UI`

---

### Issue #15: Validate Email Format in Onboarding Form
- **Description**: Add instant client-side regex email validation to onboarding profile updates.
- **Files Involved**: `src/app/(auth)/onboarding/page.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 25 mins
- **Suggested Solution**: Integrate Zod schema validation on input blur.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #16: Add 'Back to Top' Floating Button
- **Description**: Show a smooth floating arrow button when scrolling long movie lists.
- **Files Involved**: `src/components/layout/Footer.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Track `window.scrollY > 400` and trigger `window.scrollTo({ top: 0, behavior: 'smooth' })`.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #17: Add Sound Effect Mute Toggle to Watch Party
- **Description**: Allow users to toggle watch party chat sound effects on or off.
- **Files Involved**: `src/components/watchparty/ChatRoom.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 35 mins
- **Suggested Solution**: Persist `muteSounds` boolean in `localStorage`.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #18: Sanitize User Avatar Alt Text
- **Description**: Prevent potential HTML injection in image `alt` attributes across profile widgets.
- **Files Involved**: `src/components/layout/UserMenu.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 15 mins
- **Suggested Solution**: Escape special characters in user names before setting `alt` text.
- **Labels**: `good first issue`, `security`, `frontend`

---

### Issue #19: Add Connection Status Indicator in Watch Party
- **Description**: Display a small green/red dot showing WebSocket connection state (`connected` / `reconnecting`).
- **Files Involved**: `src/components/watchparty/PartyHeader.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Consume `socket.connected` state from `useSocket` hook.
- **Labels**: `good first issue`, `Socket.IO`, `frontend`

---

### Issue #20: Improve Error Message when TMDB API Fails
- **Description**: Show a friendly fallback alert when TMDB metadata network calls fail.
- **Files Involved**: `src/lib/tmdb.ts`, `src/components/ui/Alert.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Catch HTTP errors in `tmdb.ts` and return standard structured error response.
- **Labels**: `good first issue`, `backend`, `UX`

---

### Issue #21: Add Favicon and Manifest Metadata for PWA Support
- **Description**: Add PWA manifest icons and theme color meta tags.
- **Files Involved**: `src/app/layout.tsx`, `public/manifest.json`
- **Difficulty**: Easy
- **Estimated Time**: 35 mins
- **Suggested Solution**: Configure Next.js Metadata API `manifest` and `icons` properties.
- **Labels**: `good first issue`, `frontend`, `documentation`

---

### Issue #22: Add Sort Options to User Watchlist Page
- **Description**: Allow sorting watchlists by Date Added, Title, or Rating.
- **Files Involved**: `src/app/(dashboard)/watchlist/page.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 40 mins
- **Suggested Solution**: Implement client-side array sorting state hook.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #23: Add Confirmation Dialog Before Deleting Watchlist
- **Description**: Prevent accidental watchlist deletion by requiring user confirmation in a modal.
- **Files Involved**: `src/components/movie/WatchlistActions.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Trigger Radix UI AlertDialog before calling delete server action.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #24: Add Skeleton Loader for Movie DNA Radar Chart
- **Description**: Display a circular animated skeleton while taste vector calculations resolve.
- **Files Involved**: `src/components/ai/MovieDNARadar.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 25 mins
- **Suggested Solution**: Render pulse SVG circles during `isLoading` state.
- **Labels**: `good first issue`, `frontend`, `AI`

---

### Issue #25: Document Local Seed Command in README
- **Description**: Update documentation with instructions for seeding test movies.
- **Files Involved**: `README.md`, `docs/TESTING.md`
- **Difficulty**: Easy
- **Estimated Time**: 15 mins
- **Suggested Solution**: Add `npm run seed` command reference in getting started docs.
- **Labels**: `good first issue`, `documentation`

---

### Issue #26: Add Readme file to `src/types/`
- **Description**: Create a README explaining type declaration guidelines.
- **Files Involved**: `src/types/README.md`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Detail conventions for Zod schemas vs. TypeScript interfaces.
- **Labels**: `good first issue`, `documentation`

---

### Issue #27: Add Copy Button to Code Blocks in Docs
- **Description**: Add a lightweight 'Copy Code' button to code snippets on docs pages.
- **Files Involved**: `docs/index.html`
- **Difficulty**: Easy
- **Estimated Time**: 30 mins
- **Suggested Solution**: Add Docsify copy-code plugin script in documentation header.
- **Labels**: `good first issue`, `documentation`

---

### Issue #28: Format Currency Values in Stripe Billing Table
- **Description**: Format raw Stripe cents (e.g. `999`) to `$9.99`.
- **Files Involved**: `src/components/billing/PricingCard.tsx`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.
- **Labels**: `good first issue`, `Stripe`, `frontend`

---

### Issue #29: Add Focus Outline Styling for Accessibility
- **Description**: Ensure interactive buttons display visible focus rings when navigating via Keyboard Tab.
- **Files Involved**: `src/app/globals.css`
- **Difficulty**: Easy
- **Estimated Time**: 25 mins
- **Suggested Solution**: Apply `focus-visible:ring-2 focus-visible:ring-purple-500` utility rules.
- **Labels**: `good first issue`, `frontend`, `UX`

---

### Issue #30: Add ESLint Rule for Unused Imports
- **Description**: Enable automatic cleanup of unused imports across the codebase.
- **Files Involved**: `eslint.config.mjs`
- **Difficulty**: Easy
- **Estimated Time**: 20 mins
- **Suggested Solution**: Configure `@typescript-eslint/no-unused-vars` rule to `warn`.
- **Labels**: `good first issue`, `frontend`, `testing`
