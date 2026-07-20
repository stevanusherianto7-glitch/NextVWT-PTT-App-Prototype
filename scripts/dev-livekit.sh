#!/usr/bin/env bash
# scripts/dev-livekit.sh
# Jalankan LiveKit SFU lokal (docker) + NextVWT dev server dengan SFU AKTIF.
#
# Usage:
#   bash scripts/dev-livekit.sh          # start LiveKit (docker) + vite (SFU on)
#   bash scripts/dev-livekit.sh --no-docker   # asumsi LiveKit sudah jalan di :7880
#
# Butuh: docker, node/pnpm. Supabase Edge Function `livekit-token` harus sudah
# deploy & punya secret LIVEKIT_API_KEY/SECRET = devkey/devsecret... (lihat livekit/config.yaml).

set -e

LIVEKIT_WS="ws://localhost:7880"
COMPOSE_FILE="docker-compose.livekit.yml"

if [ "$1" != "--no-docker" ]; then
  echo "==> Starting LiveKit SFU via docker compose ($COMPOSE_FILE)"
  docker compose -f "$COMPOSE_FILE" up -d
  echo "==> Waiting for LiveKit health (http://localhost:7880)..."
  for i in $(seq 1 20); do
    if curl -sf -o /dev/null http://localhost:7880/ ; then
      echo "==> LiveKit is up."
      break
    fi
    sleep 1
  done
else
  echo "==> Skipping docker (--no-docker). Assuming LiveKit already on $LIVEKIT_WS"
fi

echo "==> Starting NextVWT dev server with VITE_LIVEKIT_URL=$LIVEKIT_WS"
# Export agar vite membaca env SFU (USE_SFU jadi true di config.ts)
export VITE_LIVEKIT_URL="$LIVEKIT_WS"
pnpm dev
