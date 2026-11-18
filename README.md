# Suneet's Travel Map

A Next.js map of flight routes, visited countries, and a border-guessing game. Tiles come from Mapbox.

## Run it

You need Node.js 20 or newer and a free [Mapbox access token](https://account.mapbox.com/access-tokens/).

```bash
npm install
cp .env.example .env
```

Open `.env` and set `NEXT_PUBLIC_MAPBOX_TOKEN`. The style in `.env.example` is Mapbox Standard, so the map loads without a custom style. To use one you made in [Mapbox Studio](https://studio.mapbox.com/), set `NEXT_PUBLIC_MAPBOX_STYLE_ID` to its `mapbox://styles/...` URL.

```bash
npm run dev
```

Open http://localhost:3000.

The first `dev` or `build` creates `src/data/flights.ts` when that file is missing. It copies your private log if one exists, otherwise the sample in `src/data/flights.example.ts` (a few Dublin, Amsterdam, Cork, and Gatwick legs). `src/data/flights.ts` is gitignored.

## Your own flights

Edit `src/data/flights.ts`. Legs are grouped by year. A missing date still counts in that year.

```ts
import { flight } from "./flight";
import { airlines } from "./airlines";

const flights = {
  "2024": [
    flight("Dublin", "Amsterdam", airlines.KLM, { date: "2024-06-01" }),
    flight("Amsterdam", "Dublin", airlines.KLM, { date: "2024-06-08" }),
  ],
};

export default flights;
```

`flight` takes an origin, a destination, an airline, and optional extras (`date` as `YYYY-MM-DD`, `flightNumber`, `upcoming`). Names have to match a key in `src/data/cities.ts`. Each city is `[longitude, latitude]` plus an ISO country code. Add a name to `src/data/airlines.ts`, or pass any string as the airline.

Visited countries for the scratch map are ISO codes in `src/data/visited-countries.json`.

Gallery pins are optional. Add them in `src/data/travel.ts` (`text`, `lat`, `lng`). Photos for a pin's `text` go in `src/data/city-images.ts`. Both files are empty here, so the gallery opens on the map alone.

The game reads `src/data/countries.json` and needs no extra data.

## Flight log outside the repo

The working copy stays on your machine. To keep a backup that survives a fresh clone, the scripts use `~/.config/suneets-travel/flights.ts`, or `$TRAVEL_FLIGHTS_FILE` when that is set.

| Command | What it does |
| --- | --- |
| `npm run flights:sync` | Copy `src/data/flights.ts` to the backup |
| `npm run flights:pull` | Copy the backup into `src/data/flights.ts`, or the sample if there is no backup |
| `npm run build` | Production build. Creates the working copy first, same as `dev` |

```bash
export TRAVEL_FLIGHTS_FILE=/path/to/flights.ts
```

## Deploy

A production build runs on your machine, because that is where `src/data/flights.ts` lives. Pushing to GitHub does not publish the site. Run `npm run dev` or `npm run flights:pull` once before the first deploy, so a flight log exists.

Create a [Netlify](https://www.netlify.com/) site and set its build command to `npm run build`. The Next.js runtime publishes `.next`. From this repo:

```bash
npx netlify-cli@23 link
npm run deploy
```

`npm run deploy` copies the working log to the backup, then runs `netlify deploy --prod`. A message is optional: `npm run deploy -- "Short note"`.

The site already published from this project is [travel.suneetmahajan.com](https://travel.suneetmahajan.com). Publishing that one needs a Netlify login for the `suneet-travel` site:

```bash
npx netlify-cli@23 link --name suneet-travel
```

Its domain is set in Netlify and DNS.
