# `src/components/` Directory Overview

This directory contains CineVerse's modular UI design system built with **React 19**, **Tailwind CSS v4**, **Radix UI**, **Framer Motion 12**, and **Lucide Icons**.

## 📂 Subfolder Structure

- `ui/`: Primitive atomic UI components (Button, Input, Modal, Dialog, Card, Accordion, Badge, Spinner).
- `movie/`: Movie presentation components (MovieCard, Carousel, HeroBanner, GenrePill, RatingStars).
- `ai/`: AI feature components (MovieDNARadar, ConversationalAssistantDrawer, SemanticSearchBar, AIExplanationCard).
- `watchparty/`: Real-time Watch Party components (VideoPlayer, ChatRoom, MemberList, SynchronizerBar).
- `layout/`: Global navigation components (Navbar, Sidebar, Footer, UserMenu).

## 🎨 Styling Guidelines
- Utilize Tailwind CSS utility classes.
- Use `clsx` and `tailwind-merge` (`cn()` helper in `src/lib/utils.ts`) for conditional class merging.
- Ensure components are keyboard accessible (a11y) using Radix UI primitives.
