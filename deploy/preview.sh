#!/usr/bin/env bash
# Pull request previews: https://pr-<n>.preview.javascript.cm
# Each preview is its own Docker Compose project (app + throwaway database
# seeded with demo content) on 127.0.0.1:40000+<n>, routed by a Caddy site
# file in /etc/caddy/previews (writable by the deploy user; Caddy is reloaded
# through its local admin API, no root needed).
#
#   preview.sh up <pr> <sha>    create or update
#   preview.sh down <pr>        destroy (containers, volumes, files)
#
# Requires a wildcard DNS record *.preview.javascript.cm → this server.
set -euo pipefail

MAX_PREVIEWS=3
ROOT="$HOME/apps/previews"
CADDY_DIR=/etc/caddy/previews
REPO=git@github-jscm:javascriptcm/javascript.cm.git

main() {
  local action="$1" pr="$2" sha="${3:-}"
  local dir="$ROOT/pr-$pr" host="pr-$pr.preview.javascript.cm" port=$((40000 + pr))
  mkdir -p "$ROOT"

  if [[ "$action" == down ]]; then
    if [[ -d "$dir" ]]; then
      (cd "$dir" && docker compose down -v --remove-orphans) || true
      rm -rf "$dir"
    fi
    rm -f "$CADDY_DIR/pr-$pr.caddy"
    reload_caddy
    echo "==> preview pr-$pr removed"
    return
  fi

  if [[ ! -d "$dir" ]]; then
    local count
    count=$(find "$ROOT" -maxdepth 1 -type d -name 'pr-*' | wc -l)
    if (( count >= MAX_PREVIEWS )); then
      echo "!! $count previews already running (max $MAX_PREVIEWS): close a PR or remove its preview label" >&2
      exit 3
    fi
    git clone -q "$REPO" "$dir"
  fi

  cd "$dir"
  git fetch -q origin "pull/$pr/head"
  git checkout -q --detach "$sha"

  if [[ ! -f .env ]]; then
    umask 077
    cat > .env <<ENV
COMPOSE_PROJECT_NAME=jscm-pr-$pr
APP_PORT=$port
TZ=UTC
NODE_ENV=production
HOST=0.0.0.0
PORT=3333
LOG_LEVEL=info
APP_KEY=$(openssl rand -hex 24)
APP_URL=https://$host
SESSION_DRIVER=cookie
DB_HOST=db
DB_PORT=5432
DB_USER=jscm
DB_PASSWORD=$(openssl rand -hex 16)
DB_DATABASE=jscm
LIMITER_STORE=database
SEED_DEMO=true
ENV
  fi

  docker compose build app
  docker compose up -d --remove-orphans

  for _ in $(seq 1 60); do
    curl -fsS "http://127.0.0.1:$port/up" > /dev/null 2>&1 && break
    sleep 2
  done

  cat > "$CADDY_DIR/pr-$pr.caddy" <<CADDY
$host {
	import app $port
	import noindex
}
CADDY
  reload_caddy
  echo "==> preview ready: https://$host (commit ${sha:0:7})"
}

reload_caddy() {
  caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile > /dev/null
}

main "$@"
