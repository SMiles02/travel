#!/usr/bin/env bash
# Ensure src/data/flights.ts exists for local dev / build.
# Preference order: existing local file → private copy → example stub.
set -euo pipefail

source "$(dirname "$0")/flights-paths.sh"

if [[ -f "${FLIGHTS_LOCAL}" ]]; then
  echo "Using existing ${FLIGHTS_LOCAL}"
  exit 0
fi

if [[ -f "${FLIGHTS_PRIVATE}" ]]; then
  cp "${FLIGHTS_PRIVATE}" "${FLIGHTS_LOCAL}"
  echo "Installed private flight log → ${FLIGHTS_LOCAL}"
  exit 0
fi

cp "${FLIGHTS_EXAMPLE}" "${FLIGHTS_LOCAL}"
echo "No private log found; installed sample data from flights.example.ts"
echo "Set TRAVEL_FLIGHTS_FILE or place your log at:"
echo "  ${FLIGHTS_PRIVATE}"
