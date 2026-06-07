#!/usr/bin/env sh
set -eu

echo "Starting EF pre-deploy migration"
echo "PWD=$(pwd)"

echo "Listing /app/out contents before migration"
ls -la /app/out || true

if [ -z "${ConnectionStrings__DefaultConnection:-}" ] && [ -z "${DATABASE_URL:-}" ]; then
  echo "Missing ConnectionStrings__DefaultConnection or DATABASE_URL"
  exit 1
fi

if [ ! -x /app/out/efbundle ]; then
  echo "Migration bundle not found or not executable at /app/out/efbundle"
  exit 1
fi

/app/out/efbundle --verbose

echo "EF pre-deploy migration completed successfully"
