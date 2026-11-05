import { cities, type CityName, type Coordinate } from "./cities";

export type Flight = {
  origin: Coordinate;
  destination: Coordinate;
  originName: string;
  destinationName: string;
  countryCode: string;
  airline: string;
  upcoming: boolean;
  /** ISO date YYYY-MM-DD when known */
  date?: string;
  flightNumber?: string;
};

export type FlightExtras = {
  upcoming?: boolean;
  date?: string;
  flightNumber?: string;
};

/**
 * A single flight leg. Coordinates and the destination country are
 * derived automatically from the shared `cities` constants.
 */
export function flight(
  originName: CityName,
  destinationName: CityName,
  airline: string = "",
  extras: FlightExtras | boolean = {},
): Flight {
  const opts: FlightExtras =
    typeof extras === "boolean" ? { upcoming: extras } : extras;

  const from = cities[originName];
  const to = cities[destinationName];
  if (!from) {
    throw new Error(`Unknown origin city: ${originName}`);
  }
  if (!to) {
    throw new Error(`Unknown destination city: ${destinationName}`);
  }

  return {
    origin: from.coordinates,
    destination: to.coordinates,
    originName,
    destinationName,
    countryCode: to.countryCode,
    airline,
    upcoming: opts.upcoming ?? false,
    date: opts.date,
    flightNumber: opts.flightNumber,
  };
}
