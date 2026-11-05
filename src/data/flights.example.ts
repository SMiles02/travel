import { flight } from "./flight";
import { airlines } from "./airlines";

/**
 * Sample flight log for public clones / CI.
 * Your real log lives outside git — see README "Private flight data".
 *
 * Copy this file to get started without private data:
 *   cp src/data/flights.example.ts src/data/flights.ts
 */
const flights: Record<string, ReturnType<typeof flight>[]> = {
  "2024": [
    flight("Dublin", "Amsterdam", airlines.KLM),
    flight("Amsterdam", "Dublin", airlines.KLM),
  ],
  "2025": [
    flight("Cork", "London Gatwick", airlines.Ryanair),
    flight("London Gatwick", "Cork", airlines.Ryanair),
  ],
};

export default flights;
