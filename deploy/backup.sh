#!/usr/bin/env bash
# Dump the PostgreSQL database (custom format, compressed) and archive the
# uploaded files (members' CVs, Docker volume "uploads" mounted on
# /app/storage), and keep the last BACKUP_KEEP_DAYS days of both. Run from
# the repository root's deploy/ dir by the jscm-backup systemd timer (see
# deploy/README section in README.md).
#
# Restore:
#   docker compose exec -T db pg_restore -U <user> -d <db> --clean --if-exists < file.dump
#   docker compose exec -T app tar -C /app/storage -xzf - < file-uploads.tgz
set -euo pipefail

main() {
  cd "$(dirname "$0")/.."
  # Dumps and archives contain personal data: owner-only from the start.
  umask 077

  local dir="${BACKUP_DIR:-$HOME/backups/jscm}"
  local keep="${BACKUP_KEEP_DAYS:-14}"
  local db_user db_name
  db_user="$(grep -E '^DB_USER=' .env | cut -d= -f2-)"
  db_name="$(grep -E '^DB_DATABASE=' .env | cut -d= -f2-)"

  install -d -m 700 "$dir"
  local file="$dir/jscm-$(date -u +%Y%m%dT%H%M%SZ).dump"

  docker compose exec -T db pg_dump -U "$db_user" -d "$db_name" --format=custom --no-owner > "$file.tmp"
  mv "$file.tmp" "$file"
  chmod 600 "$file"
  echo "backup: $file ($(du -h "$file" | cut -f1))"

  # Uploaded files (CVs contain personal data: same 600 permissions).
  local uploads="${file%.dump}-uploads.tgz"
  docker compose exec -T app tar -C /app/storage -czf - . > "$uploads.tmp"
  mv "$uploads.tmp" "$uploads"
  chmod 600 "$uploads"
  echo "backup: $uploads ($(du -h "$uploads" | cut -f1))"

  find "$dir" -type f \( -name 'jscm-*.dump' -o -name 'jscm-*-uploads.tgz' \) -mtime +"$keep" -delete
}

main "$@"
