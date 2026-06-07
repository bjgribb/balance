#!/usr/bin/env sh
set -eux

echo "Starting EF pre-deploy migration"
echo "PWD=$(pwd)"

echo "Listing /app/out contents before migration"
ls -la /app/out || true

DB_CONN="${ConnectionStrings__DefaultConnection:-${DATABASE_URL:-}}"
if [ -z "$DB_CONN" ]; then
  echo "Missing ConnectionStrings__DefaultConnection or DATABASE_URL"
  exit 1
fi

if [ ! -x /app/out/efbundle ]; then
  echo "Migration bundle not found or not executable at /app/out/efbundle"
  exit 1
fi

/app/out/efbundle --verbose --connection "$DB_CONN"

echo "EF pre-deploy migration completed successfully"
