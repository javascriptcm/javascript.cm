#!/usr/bin/env bash
# Nightly backups of every environment present on the server (staging in
# ~/apps/javascript.cm, production in ~/apps/javascript.cm-prod):
#   1. PostgreSQL dump (custom format, compressed)
#   2. uploaded files (CVs, images: Docker volume mounted on /app/storage)
# kept locally for BACKUP_KEEP_DAYS days, then — when RESTIC_REPOSITORY is
# configured (systemd EnvironmentFile /etc/jscm/backup.env) — pushed off-site
# with restic: encrypted client-side, deduplicated, retention 7 daily /
# 8 weekly / 12 monthly.
#
# Restore (from the environment's directory):
#   docker compose exec -T db pg_restore -U <user> -d <db> --clean --if-exists < file.dump
#   docker compose exec -T app tar -C /app/storage -xzf - < file-uploads.tgz
#   restic restore latest --tag <project> --target /tmp/restore   (off-site copy)
set -euo pipefail

backup_environment() {
  local project_dir="$1" dir="$2"
  cd "$project_dir"
  local name db_user db_name
  name="$(grep -E '^COMPOSE_PROJECT_NAME=' .env | cut -d= -f2- || true)"
  name="${name:-jscm}"
  db_user="$(grep -E '^DB_USER=' .env | cut -d= -f2-)"
  db_name="$(grep -E '^DB_DATABASE=' .env | cut -d= -f2-)"

  local stamp file uploads
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  file="$dir/$name-$stamp.dump"
  uploads="$dir/$name-$stamp-uploads.tgz"

  docker compose exec -T db pg_dump -U "$db_user" -d "$db_name" --format=custom --no-owner > "$file.tmp"
  mv "$file.tmp" "$file"
  echo "backup: $file ($(du -h "$file" | cut -f1))"

  docker compose exec -T app tar -C /app/storage -czf - . > "$uploads.tmp"
  mv "$uploads.tmp" "$uploads"
  echo "backup: $uploads ($(du -h "$uploads" | cut -f1))"
}

main() {
  # Dumps and archives contain personal data: owner-only from the start.
  umask 077
  local dir="${BACKUP_DIR:-$HOME/backups/jscm}"
  local keep="${BACKUP_KEEP_DAYS:-14}"
  install -d -m 700 "$dir"

  local project
  for project in "$HOME/apps/javascript.cm" "$HOME/apps/javascript.cm-prod"; do
    if [[ -f "$project/.env" ]] && (cd "$project" && docker compose ps --status running -q db | grep -q .); then
      backup_environment "$project" "$dir"
    fi
  done

  find "$dir" -type f \( -name '*.dump' -o -name '*-uploads.tgz' \) -mtime +"$keep" -delete

  if [[ -n "${RESTIC_REPOSITORY:-}" ]]; then
    restic snapshots --latest 1 > /dev/null 2>&1 || restic init
    restic backup --quiet --tag jscm --host jscm "$dir"
    restic forget --quiet --tag jscm --keep-daily 7 --keep-weekly 8 --keep-monthly 12 --prune
    echo "off-site: snapshot pushed to $RESTIC_REPOSITORY"
  else
    echo "off-site: skipped (RESTIC_REPOSITORY not configured in /etc/jscm/backup.env)"
  fi
}

main "$@"
