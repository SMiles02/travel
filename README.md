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

Production is the Netlify site [suneet-travel](https://travel.suneetmahajan.com). It is not connected to GitHub, so a deploy has to run on a machine that has the private flight log. Link that machine once:

```bash
npx netlify-cli@23 link --name suneet-travel
```

Then:

```bash
npm run deploy
```

This syncs the flight log to the private backup and runs `netlify deploy --prod`. Netlify runs the production build, which compiles the local `flights.ts` into the site. The source file stays gitignored and is not uploaded.

The custom domain is configured in the Netlify project and DNS, not in this script.
