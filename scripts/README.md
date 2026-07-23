# `scripts/` Directory Overview

This directory contains utility scripts for DevOps deployment automation, GitHub label configuration, and production maintenance.

## 📂 Scripts Catalog

- **`deploy.sh`**: Automated shell script executed on AWS EC2 servers to pull Docker images from GHCR, run Prisma database migrations, and restart containers with zero downtime.
- **`setup-labels.js`**: JavaScript utility to automatically configure standard GitHub label sets on the repository.

## 🛠️ Usage

```bash
# Run deployment automation (called automatically by GitHub Actions)
bash scripts/deploy.sh

# Run label setup manifest
node scripts/setup-labels.js
```
