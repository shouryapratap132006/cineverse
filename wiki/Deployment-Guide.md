# Production Deployment Guide

Deploying CineVerse to AWS EC2 using Docker and Caddy Server.

---

## ⚡ Deployment Steps
1. Push changes to `main` branch.
2. GitHub Actions runs `.github/workflows/deploy.yml`.
3. Image is published to GHCR (`ghcr.io/shouryapratap132006/cineverse`).
4. SSH script executes `scripts/deploy.sh` on AWS EC2 to pull image, apply Prisma migrations, and reload containers.
