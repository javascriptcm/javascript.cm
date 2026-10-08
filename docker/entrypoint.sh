#!/bin/sh
# Apply migrations and idempotent seeders (channels/tags; demo content only
# when SEED_DEMO=true), then start the server.
set -e

node ace migration:run --force
node ace db:seed

exec "$@"
