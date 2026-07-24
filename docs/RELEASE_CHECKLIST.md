# Release Engineering Checklist

Follow this checklist prior to tagging and publishing a new release of **CineVerse**.

---

## 📋 Pre-Release Tasks

- [ ] All feature PRs merged into `main`.
- [ ] TypeScript typecheck passes cleanly (`npm run typecheck`).
- [ ] ESLint passes cleanly (`npm run lint`).
- [ ] Unit & Integration tests pass (`npm run test`).
- [ ] Database migrations tested against empty and existing schemas (`npm run prisma:migrate`).
- [ ] Docker image builds cleanly (`npm run docker:build`).
- [ ] `CHANGELOG.md` updated with new features and bug fixes.
- [ ] Semantic version bumped in `package.json`.
- [ ] GitHub release tag published (e.g. `v0.2.0`).
