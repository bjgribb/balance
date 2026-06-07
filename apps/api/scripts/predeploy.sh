#!/usr/bin/env sh
set -eu

echo "Running EF pre-deploy migration"

if [ -z "${ConnectionStrings__DefaultConnection:-}" ] && [ -z "${DATABASE_URL:-}" ]; then
  echo "Missing ConnectionStrings__DefaultConnection or DATABASE_URL"
  exit 1
fi

if [ ! -x /app/out/efbundle ]; then
  echo "Migration bundle not found or not executable at /app/out/efbundle"
  exit 1
fi

/app/out/efbundle

echo "EF pre-deploy migration completed"
