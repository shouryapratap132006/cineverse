# Deploying Cineverse to EC2 (build on the host)

This app is a Next.js 16 app with a **custom Socket.IO server** (`server.ts`) and **Prisma 7**.
The image is built with a multi-stage `Dockerfile` (Alpine + production-only deps + precompiled
server) and run with `docker compose`. Migrations run automatically before the app starts.

---

## Target instance (cineverse-production)

- **Instance ID:** `i-0b25d00c70c3517ee`
- **Public IP:** `16.16.173.58`
- **Public DNS:** `ec2-16-16-173-58.eu-north-1.compute.amazonaws.com`
- **Region/AZ:** `eu-north-1` / `eu-north-1c`
- **Type:** `t3.micro` (1 GB RAM) — **see the swap step below; the build will OOM without it.**

## 1. Prepare the instance

- **Security group inbound:** `22` (SSH, your IP), `3000` (app), and `80`/`443` if you add a
  reverse proxy. Check the instance's **Security** tab.
- **Disk:** at least 20 GB.

### Add swap (required on t3.micro — 1 GB RAM)

`next build` runs with `--max-old-space-size=4096` and will be OOM-killed on 1 GB without swap.
A 4 GB swap file fixes it (slower builds, but works; the running app is light):

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab   # persist across reboots
free -h   # confirm 4Gi swap
```

> Alternatively, resize to `t3.small`/`t3.medium` (Stop → Change instance type → Start) and skip swap.

## 2. Install Docker + Compose

Amazon Linux 2023:
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER   # log out/in for this to take effect
```
Ubuntu:
```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

## 2. SSH in

```bash
# user: ec2-user (Amazon Linux) or ubuntu (Ubuntu). Use your key pair's .pem.
ssh -i ~/path/to/your-key.pem ec2-user@16.16.173.58
```

## 3. Get the code

```bash
git clone <your-repo-url> cineverse
cd cineverse
git checkout docker-ec2-deploy   # or main once merged
```

## 4. Create the `.env` file

Compose reads `./.env` for **both** runtime env (`env_file`) and build-time
interpolation of `NEXT_PUBLIC_*` values. Create it on the host (never commit it):

```dotenv
# --- Database (e.g. RDS Postgres) ---
DATABASE_URL=postgresql://user:pass@host:5432/cineverse

# --- Clerk ---
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# --- Pusher ---
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=...

# --- Groq / AI ---
GROQ_API_KEY=...
GROQ_MODEL=...
AI_PROVIDER=...
AI_FALLBACK_MODEL=...
AI_SERVICE_URL=...

# --- TMDB ---
NEXT_PUBLIC_TMDB_API_KEY=...
```

> `NEXT_PUBLIC_*` values are compiled into the browser bundle at build time, so they must be
> present in `.env` **before** you build. If you change one, you must rebuild (`--build`).

## 5. Build and run

```bash
docker compose up -d --build
```

This will:
1. Build the image (linux/amd64 — matches the EC2 host, no `--platform` needed).
2. Run `prisma migrate deploy` (the `migrate` service) against `DATABASE_URL`.
3. Start the app on port `3000` once migrations succeed.

Check it:
```bash
docker compose ps
docker compose logs -f app
curl http://localhost:3000
```

## 6. Updating after a code change

```bash
git pull
docker compose up -d --build
docker image prune -f          # reclaim old layers
```

---

## Notes & gotchas

- **Image size:** the multi-stage build ships only production deps + a precompiled server on
  Alpine. If it's still large, run `docker images cineverse` to confirm and
  `docker history cineverse:latest` to see what dominates.
- **WebSockets:** Socket.IO is served at path `/api/socket` on the same port (3000). If you put
  Nginx/ALB in front, enable WebSocket upgrade (`proxy_set_header Upgrade`/`Connection`, or ALB
  stickiness) or realtime features will fail.
- **Migrations need the DB reachable** from EC2 (security group / VPC rules for RDS).
- **Don't bake secrets:** `.env` is git-ignored and excluded via `.dockerignore`; only the public
  `NEXT_PUBLIC_*` values get compiled into the client bundle.
- **CI:** `.github/workflows/docker-build.yml` validates the image builds on every push. It does
  not push to a registry (you build on EC2); an ECR block is included, commented, if you switch later.
