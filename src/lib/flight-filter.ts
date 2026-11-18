import { flightCityLabel } from "@/lib/mapbox/flight-city-labels";

type FilterableFlight = {
  originName: string;
  destinationName: string;
  airline: string;
};

/** Case-insensitive match on either city, either airport name, or the airline. */
export function filterFlights<T extends FilterableFlight>(
  flights: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...flights];
  return flights.filter((flight) => {
    const fields = [
      flight.originName,
      flight.destinationName,
      flightCityLabel(flight.originName),
      flightCityLabel(flight.destinationName),
      flight.airline,
    ];
    return fields.some((field) => field.toLowerCase().includes(needle));
  });
}
