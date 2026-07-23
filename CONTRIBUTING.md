# Contributing to CineVerse

First off, thank you for considering contributing to **CineVerse**! 🎉

Whether you're fixing a bug, adding a new AI recommendation algorithm, improving documentation, or creating beginner-friendly UI components, your contributions help make CineVerse the premier open-source platform for movie lovers and AI enthusiasts.

---

## 📜 Table of Contents
1. [Code of Conduct](#-code-of-conduct)
2. [Getting Started & Local Setup](#-getting-started--local-setup)
3. [Development Workflow](#-development-workflow)
4. [Branch Naming Conventions](#-branch-naming-conventions)
5. [Commit Message Guidelines](#-commit-message-guidelines)
6. [Coding Standards](#-coding-standards)
7. [Testing & Verification](#-testing--verification)
8. [Submitting a Pull Request](#-submitting-a-pull-request)
9. [Issue Reporting](#-issue-reporting)
10. [Local Docker Setup](#-local-docker-setup)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by the [CineVerse Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **conduct@cineverse.app**.

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**: v2.x or higher
- **Docker & Docker Compose** (Optional, for local container development)

### Quick Onboarding (10-15 Minutes)

1. **Fork the Repository**
   Click the "Fork" button at the top right of the [CineVerse GitHub Repository](https://github.com/shouryapratap132006/cineverse).

2. **Clone your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cineverse.git
   cd cineverse
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Fill in your local environment variables in `.env`. For local development without paid APIs, default keys and local PostgreSQL values will work for core UI rendering.

5. **Initialize Database Schema**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 Development Workflow

1. Always pull the latest changes from the `main` branch before starting work:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create a feature branch off `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and test locally.
4. Run code quality checks:
   ```bash
   npm run lint
   npm run typecheck
   ```

---

## 🌿 Branch Naming Conventions

Use short, descriptive branch names prefixed with the category of change:

| Prefix | Category | Example |
| ------ | -------- | ------- |
| `feat/` | New feature or functionality | `feat/recommendation-filtering` |
| `fix/` | Bug fix | `fix/socket-reconnection-leak` |
| `docs/` | Documentation improvements | `docs/update-architecture-diagram` |
| `refactor/` | Code refactoring without behavioral change | `refactor/taste-service-clean` |
| `perf/` | Performance optimizations | `perf/discover-query-cache` |
| `test/` | Adding or updating tests | `test/ai-gateway-unit-tests` |

---

## 💬 Commit Message Guidelines

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <short summary>

[optional message body]

[optional issue reference]
```

### Examples:
- `feat(ai): add streaming response handler to Groq orchestrator`
- `fix(auth): handle missing user sync webhook payload cleanly`
- `docs(readme): update quickstart installation commands`
- `refactor(db): add composite index on movie taste vectors`

---

## 🎨 Coding Standards

- **TypeScript**: Strict mode is enabled. Do not use `any` unless absolutely necessary (provide comments explaining why).
- **React Components**: Use functional components with typed props interface.
- **Styling**: Use Tailwind CSS classes. Avoid arbitrary values where Tailwind utilities exist.
- **Formatting**: Keep code formatted cleanly using Prettier (`npm run format`).
- **Imports**: Organize imports logically (External libraries -> Internal absolute imports `@/...` -> Relative imports).

---

## 🧪 Testing & Verification

Before submitting a PR, verify your changes pass all local verification steps:

```bash
# Check TypeScript types
npm run typecheck

# Check ESLint compliance
npm run lint

# Run unit tests
npm run test
```

---

## 📥 Submitting a Pull Request

1. Push your feature branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request on the main repository.
3. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely.
4. Link the relevant GitHub Issue (e.g. `Fixes #42`).
5. Respond constructively to code review feedback from maintainers.

---

## 🐛 Issue Reporting

Before opening an issue, check the existing issues to ensure it hasn't already been reported.

When opening an issue, use our structured issue templates:
- 🐛 **Bug Report**: Report reproducible bugs.
- ✨ **Feature Request**: Propose new ideas or enhancements.
- 📚 **Documentation**: Report errors or suggest improvements in docs.
- 🧠 **AI Improvement**: Suggest enhancements for LangGraph/RAG pipelines.
- ⚡ **Performance Issue**: Report slow pages or memory spikes.

---

## 🐳 Local Docker Setup

To develop within Docker containers:

```bash
# Build and start all services (App + PostgreSQL)
npm run docker:up

# Check logs
docker-compose logs -f

# Stop containers
npm run docker:down
```
