#!/usr/bin/env bash
# Pull the deployed branch and (re)build the stack. Run on the server, from
# the repository root, as a user in the "docker" group:
#   ./deploy/deploy.sh [branch]
set -euo pipefail

# Wrapped in a function: bash parses it fully before running, so the
# "git reset" below can safely rewrite this very file.
main() {
  BRANCH="${1:-staging}"
  cd "$(dirname "$0")/.."

  echo "==> $(date -u +%FT%TZ) deploying ${BRANCH}"
  git fetch --prune origin "${BRANCH}"
  git checkout -q "${BRANCH}"
  git reset -q --hard "origin/${BRANCH}"
  echo "==> at $(git log -1 --format='%h %s')"

  docker compose build --pull app
  docker compose up -d --remove-orphans

  echo "==> waiting for health check"
  for _ in $(seq 1 60); do
    if curl -fsS http://127.0.0.1:3333/up >/dev/null 2>&1; then
      echo "==> healthy"
      docker image prune -f >/dev/null
      exit 0
    fi
    sleep 2
  done

  echo "!! app did not become healthy, recent logs:" >&2
  docker compose logs --tail=80 app >&2
  exit 1
}

main "$@"
