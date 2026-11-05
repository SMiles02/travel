import flightsData from "@/data/flights";
import type { Flight } from "@/data/flight";

export const ALL_YEARS = "all";

export const FLIGHT_YEARS = Object.keys(flightsData).sort(
  (a, b) => Number(b) - Number(a),
);

export type FlightEntry = Flight & {
  year: string;
  yearIndex: number;
};

export function flightKey(flight: FlightEntry): string {
  return `${flight.year}__${flight.yearIndex}__${flight.originName}__${flight.destinationName}`;
}

/** Flights for one year, or every year when selection is `all`. */
export function getFlightsForYear(selectedYear: string): FlightEntry[] {
  const years =
    selectedYear === ALL_YEARS
      ? Object.keys(flightsData).sort((a, b) => Number(a) - Number(b))
      : [selectedYear];

  const entries: FlightEntry[] = [];
  for (const year of years) {
    const yearFlights = (flightsData as Record<string, Flight[]>)[year] || [];
    yearFlights.forEach((flight, yearIndex) => {
      entries.push({ ...flight, year, yearIndex });
    });
  }
  return entries;
}
