# Deploying Cineverse to EC2 (1 GB t3.micro)

Next.js 16 app with a **custom Socket.IO server** (`server.ts`) and **Prisma 7**, containerized
with a multi-stage `Dockerfile` (Alpine, production-only deps, precompiled server).

## Target instance (cineverse-production)

| | |
|---|---|
| Instance ID | `i-0b25d00c70c3517ee` |
| Public IP | `16.16.173.58` |
| Public DNS | `ec2-16-16-173-58.eu-north-1.compute.amazonaws.com` |
| Region/AZ | `eu-north-1` / `eu-north-1c` |
| Type | `t3.micro` — **1 GB RAM** |

> ⚠️ **1 GB is too small to *build* Next.js.** `next build` needs several GB and will be
> OOM-killed on this instance. So we **build on your Mac and ship the finished image** to EC2;
> the instance only *runs* it. This is Method A below (recommended).

---

## Method A (best) — Automated CD: push to deploy (GitHub Actions)

`.github/workflows/deploy.yml` runs on every push to `main` / `docker-ec2-deploy`. It builds the
image on GitHub's runner (native amd64, fast), streams it to EC2 over SSH, migrates, and restarts.
The host never builds. After the one-time setup below, **deploying = `git push`.**

### One-time: add repo secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret | Value |
|---|---|
| `EC2_HOST` | `16.16.173.58` |
| `EC2_SSH_KEY` | full contents of your `.pem` private key |
| `ENV_FILE` | full contents of your `.env` (used for `NEXT_PUBLIC_*` build args) |

Optional **variable** `EC2_USER` (default `ec2-user`; set `ubuntu` for Ubuntu AMIs).

### One-time: on the instance
- Install Docker (see Method B), create `~/cineverse/.env` with the **runtime** secrets.
- **Security group:** the GitHub runner needs to SSH in. Runner IPs are dynamic, so either open
  inbound `22` to `0.0.0.0/0` (key-only auth — password login is off by default on EC2) or use a
  self-hosted runner / AWS SSM. Also keep `3000` open for the app.

Then just `git push` — watch it under the repo's **Actions** tab.

---

## Method B — Build on your Mac, ship to EC2 (no CI)

The host never builds. One script does everything: build for `linux/amd64`, ship over SSH,
run migrations, start the app.

### One-time setup on the instance
```bash
ssh -i ~/path/to/key.pem ec2-user@16.16.173.58

# Install Docker + compose plugin
sudo dnf install -y docker            # Amazon Linux 2023  (Ubuntu: sudo apt-get install -y docker.io docker-compose-plugin)
sudo systemctl enable --now docker
sudo usermod -aG docker $USER         # log out/in for group change

# Create the runtime .env (see template at the bottom)
mkdir -p ~/cineverse
nano ~/cineverse/.env
```

### Deploy (from your Mac, in the repo root)
```bash
# .env in the repo root supplies the NEXT_PUBLIC_* build args (public values)
EC2_HOST=16.16.173.58 SSH_KEY=~/path/to/key.pem ./scripts/deploy.sh
```
The script:
1. builds `cineverse:latest` (app) + `cineverse:migrate` (Prisma) for `linux/amd64`,
2. `scp`s `docker-compose.prebuilt.yml` to the host as `docker-compose.yml`,
3. streams the images over SSH (`docker save | gzip | docker load`) — no registry needed,
4. runs `prisma migrate deploy`, then starts the app.

> The build runs under QEMU emulation on your Mac (amd64), so it's slower than native — that's
> normal. Your Mac has plenty of RAM; the EC2 box never feels it.

### Redeploy after a code change
Just re-run the same command. To update only the runtime `.env`, edit it on the host and
`docker compose up -d` there.

---

## Method C — Build on the host (only if you resize the instance, or add swap)

Building on-box needs memory. On 1 GB you **must add swap first** (slow but works); better,
resize to `t3.small`/`t3.medium`.

```bash
ssh -i ~/path/to/key.pem ec2-user@16.16.173.58

# 4 GB swap so `next build` doesn't get OOM-killed
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h                                # confirm 4Gi swap

git clone <your-repo-url> cineverse && cd cineverse
git checkout docker-ec2-deploy
nano .env                              # runtime + NEXT_PUBLIC_* build values
docker compose up -d --build           # builds here, runs migrations, starts app
```

---

## Before it works — checklist

1. **Security group inbound:** open `22` (SSH, your IP) and `3000` (app). EC2 → instance →
   **Security** tab → edit inbound rules. Then browse `http://16.16.173.58:3000`.
2. **Database reachable:** if Postgres is RDS, its security group must allow inbound from this
   EC2 instance. Migrations (`migrate` service) need the DB reachable.
3. **`.env` present on the host** at `~/cineverse/.env` (Methods A & B) or repo root (Method C).

## `.env` template

```dotenv
DATABASE_URL=postgresql://user:pass@host:5432/cineverse

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

GROQ_API_KEY=...
GROQ_MODEL=...
AI_PROVIDER=...
AI_FALLBACK_MODEL=...
AI_SERVICE_URL=...

NEXT_PUBLIC_TMDB_API_KEY=...
```

> `NEXT_PUBLIC_*` are compiled into the browser bundle at **build time** — they must be set
> wherever the build runs (your Mac for Method A; the host for Method B). Change one → rebuild.

## Notes

- **Runtime memory:** the app image caps V8 heap at 512 MB (`NODE_OPTIONS` in the Dockerfile) to
  fit 1 GB. If you resize the instance, raise it by setting `NODE_OPTIONS` in `.env`.
- **WebSockets:** Socket.IO serves at `/api/socket` on port 3000. If you add Nginx/ALB in front,
  enable WebSocket upgrade or realtime features break.
- **Image size:** multi-stage + Alpine + prod-only deps keeps it small (~150–250 MB gzipped for
  transfer). Inspect with `docker images cineverse` / `docker history cineverse:latest`.
- **CI:** `.github/workflows/docker-build.yml` validates the image builds on every push.
