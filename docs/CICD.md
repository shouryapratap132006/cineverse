# CI/CD Pipeline Automation

CineVerse uses **GitHub Actions** for continuous integration and automated deployment.

---

## ⚡ Workflow Breakdown (`.github/workflows/deploy.yml`)

1. **Trigger**: Push event to `main` branch or manual `workflow_dispatch`.
2. **Lint & Typecheck**: Executes `npm run lint` and `npm run typecheck`.
3. **Build & Package**: Builds standalone Docker container image.
4. **Publish to GHCR**: Pushes image tagged with `latest` and commit SHA to `ghcr.io/shouryapratap132006/cineverse`.
5. **SSH Deploy**: Executes `scripts/deploy.sh` on the target EC2 instance via SSH.
