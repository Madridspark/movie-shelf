#!/usr/bin/env bash
set -euo pipefail

REMOTE="${MOVIE_SHELF_REMOTE:-ai-tools}"
REMOTE_DIR="${MOVIE_SHELF_REMOTE_DIR:-/opt/projects/movie-shelf}"
BRANCH="${MOVIE_SHELF_BRANCH:-main}"
PUBLIC_URL="${MOVIE_SHELF_PUBLIC_URL:-https://movie.zhangpengbo.com}"

if [[ "${MOVIE_SHELF_SYNC_ENV:-0}" == "1" ]]; then
  scp .env "${REMOTE}:${REMOTE_DIR}/.env"
  ssh "${REMOTE}" "chmod 600 '${REMOTE_DIR}/.env'"
fi

ssh "${REMOTE}" "set -e; cd '${REMOTE_DIR}'; git fetch origin '${BRANCH}'; git reset --hard 'origin/${BRANCH}'; test -s .env; docker compose up -d --build"
MOVIE_SHELF_BASE_URL="${PUBLIC_URL}" node scripts/smoke.mjs
