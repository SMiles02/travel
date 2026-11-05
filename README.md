# Suneet's Travel Map

An interactive travel visualization built with Next.js and Mapbox GL JS.

## Features

- **Gallery**: View travel locations with images
- **Scratch Map**: Highlight visited countries
- **Flights**: Visualize flight paths by year
- **Game**: Guess countries from their borders

## Setup

1. Install dependencies (Node 20+):

```bash
nvm use
npm install
```

2. Create a `.env` file with your Mapbox credentials:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
NEXT_PUBLIC_MAPBOX_STYLE_ID=mapbox://styles/username/style_id
```

3. Flight data is **private** and gitignored. On `npm run dev` / `build`, the app will:

- use `src/data/flights.ts` if present, else
- copy from `~/.config/suneets-travel/flights.ts` (or `$TRAVEL_FLIGHTS_FILE`), else
- fall back to the public sample `src/data/flights.example.ts`

To start from the sample:

```bash
cp src/data/flights.example.ts src/data/flights.ts
```

4. Run the development server:

```bash
npm run dev
```

## Private flight data

| Path | Role |
| --- | --- |
| `src/data/flights.ts` | Working copy (gitignored) |
| `~/.config/suneets-travel/flights.ts` | Canonical private backup |
| `src/data/flights.example.ts` | Public sample for clones |

```bash
npm run flights:sync   # save working copy → private backup
npm run flights:pull   # ensure working copy exists (private or example)
```

Override the private path anytime:

```bash
export TRAVEL_FLIGHTS_FILE=/path/to/your/flights.ts
```

## Deploy (one liner)

Requires the [Vercel CLI](https://vercel.com/docs/cli) (used via `npx`) and a linked project (`npx vercel link` once).

```bash
npm run deploy
```

This syncs your flight log to the private backup, builds, and runs `vercel --prod`. The real `flights.ts` never needs to be on GitHub — only the machine that deploys needs it.

Custom domain (e.g. `travel.suneetmahajan.com`) is configured in the Vercel project + DNS, not in this script.

## Note on git history

If this repo was ever public (or will be) with a real `flights.ts` already committed, remove it from history or push to a fresh public repo that never contained the private log. `.gitignore` alone does not erase past commits.
