#!/usr/bin/env bash
# Shared paths for private flight data.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLIGHTS_LOCAL="${REPO_ROOT}/src/data/flights.ts"
FLIGHTS_EXAMPLE="${REPO_ROOT}/src/data/flights.example.ts"
FLIGHTS_PRIVATE="${TRAVEL_FLIGHTS_FILE:-${HOME}/.config/suneets-travel/flights.ts}"
