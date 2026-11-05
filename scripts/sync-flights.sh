#!/usr/bin/env bash
# Save the working copy of flights.ts to the private location.
set -euo pipefail

source "$(dirname "$0")/flights-paths.sh"

if [[ ! -f "${FLIGHTS_LOCAL}" ]]; then
  echo "error: ${FLIGHTS_LOCAL} not found. Nothing to sync." >&2
  exit 1
fi

mkdir -p "$(dirname "${FLIGHTS_PRIVATE}")"
cp "${FLIGHTS_LOCAL}" "${FLIGHTS_PRIVATE}"
echo "Synced → ${FLIGHTS_PRIVATE}"
