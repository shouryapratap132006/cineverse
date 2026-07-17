#!/usr/bin/env bash
set -euo pipefail

# Deploy Cineverse to a small (1 GB) EC2 host WITHOUT building on it.
# Builds the images on your Mac (linux/amd64), ships them over SSH, and runs them.
#
# Usage:
#   EC2_HOST=16.16.173.58 SSH_KEY=~/keys/cineverse.pem ./scripts/deploy.sh
#
# Optional env:
#   SSH_USER    default: ec2-user   (use 'ubuntu' on Ubuntu AMIs)
#   REMOTE_DIR  default: ~/cineverse

EC2_HOST="${EC2_HOST:?set EC2_HOST, e.g. 16.16.173.58}"
SSH_KEY="${SSH_KEY:?set SSH_KEY, path to your .pem}"
SSH_USER="${SSH_USER:-ec2-user}"
REMOTE_DIR="${REMOTE_DIR:-~/cineverse}"
SSH="ssh -i $SSH_KEY $SSH_USER@$EC2_HOST"

# Load NEXT_PUBLIC_* build args from local .env (public values, inlined at build time).
if [ -f .env ]; then set -a; . ./.env; set +a; fi

echo "==> [1/5] Building images on this Mac for linux/amd64 (QEMU emulation — slow but reliable)"
docker buildx build --platform linux/amd64 --target runner \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" \
  --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:-}" \
  --build-arg NEXT_PUBLIC_PUSHER_KEY="${NEXT_PUBLIC_PUSHER_KEY:-}" \
  --build-arg NEXT_PUBLIC_PUSHER_CLUSTER="${NEXT_PUBLIC_PUSHER_CLUSTER:-}" \
  --build-arg NEXT_PUBLIC_TMDB_API_KEY="${NEXT_PUBLIC_TMDB_API_KEY:-}" \
  --build-arg DATABASE_URL="${DATABASE_URL:-}" \
  -t cineverse:latest --load .

docker buildx build --platform linux/amd64 --target migrator \
  -t cineverse:migrate --load .

echo "==> [2/5] Ensuring remote dir + .env exist"
$SSH "mkdir -p $REMOTE_DIR"
$SSH "test -f $REMOTE_DIR/.env" || {
  echo "ERROR: $REMOTE_DIR/.env is missing on the host."
  echo "       Create it on the instance first (see DEPLOY.md for the template), then re-run."
  exit 1
}

echo "==> [3/5] Copying compose file to the host"
scp -i "$SSH_KEY" docker-compose.prebuilt.yml "$SSH_USER@$EC2_HOST:$REMOTE_DIR/docker-compose.yml"

echo "==> [4/5] Shipping images (gzipped over SSH)"
docker save cineverse:latest cineverse:migrate | gzip | $SSH "gunzip | docker load"

echo "==> [5/5] Starting on the host (migrations run first, then the app)"
$SSH "cd $REMOTE_DIR && docker compose up -d && docker compose ps"

echo ""
echo "Done. App should be live at: http://$EC2_HOST:3000"
echo "Logs: $SSH 'cd $REMOTE_DIR && docker compose logs -f app'"
