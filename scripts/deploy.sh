#!/usr/bin/env bash
# One-liner production deploy with private flight data injected.
#
# Usage:
#   npm run deploy
#   # or
#   ./scripts/deploy.sh
#
# Requires: Node 20+, Vercel CLI (npx vercel), Mapbox env in .env or Vercel project.
set -euo pipefail

source "$(dirname "$0")/flights-paths.sh"
cd "${REPO_ROOT}"

# Prefer the working tree file (what you've been editing), fall back to private store.
if [[ -f "${FLIGHTS_LOCAL}" ]]; then
  mkdir -p "$(dirname "${FLIGHTS_PRIVATE}")"
  cp "${FLIGHTS_LOCAL}" "${FLIGHTS_PRIVATE}"
  echo "Synced working flight log → ${FLIGHTS_PRIVATE}"
elif [[ -f "${FLIGHTS_PRIVATE}" ]]; then
  cp "${FLIGHTS_PRIVATE}" "${FLIGHTS_LOCAL}"
  echo "Installed private flight log → ${FLIGHTS_LOCAL}"
else
  echo "error: no flight log found." >&2
  echo "Expected either:" >&2
  echo "  ${FLIGHTS_LOCAL}" >&2
  echo "  ${FLIGHTS_PRIVATE}" >&2
  echo "Override path with TRAVEL_FLIGHTS_FILE=/path/to/flights.ts" >&2
  exit 1
fi

# Load nvm Node 20 when available
if [[ -s "${HOME}/.nvm/nvm.sh" ]]; then
  # shellcheck disable=SC1091
  source "${HOME}/.nvm/nvm.sh"
  nvm use 20 >/dev/null || nvm use >/dev/null || true
fi

echo "Building…"
npm run build

echo "Deploying to Vercel (production)…"
npx --yes vercel --prod --yes

echo "Done. Flight log remains gitignored; private copy at:"
echo "  ${FLIGHTS_PRIVATE}"
