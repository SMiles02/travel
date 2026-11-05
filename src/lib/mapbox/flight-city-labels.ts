import flights from "@/data/flights";
import { cities, type CityName, type Coordinate } from "@/data/cities";

/** Collapse airport endpoints onto a single city label. */
const LABEL_CITY: Partial<Record<CityName, CityName>> = {
  "London Gatwick": "London",
  "London Heathrow": "London",
  "London Stansted": "London",
};

export type FlightCityLabel = {
  name: string;
  coordinates: Coordinate;
};

/** Unique city labels for places that appear in the flight log. */
export function getFlightCityLabels(): FlightCityLabel[] {
  const labels = new Map<string, FlightCityLabel>();

  for (const yearFlights of Object.values(flights)) {
    for (const flight of yearFlights) {
      for (const endpoint of [flight.originName, flight.destinationName]) {
        const cityName = (LABEL_CITY[endpoint as CityName] ??
          endpoint) as CityName;
        const city = cities[cityName];
        if (!city || labels.has(cityName)) continue;
        labels.set(cityName, {
          name: cityName,
          coordinates: city.coordinates,
        });
      }
    }
  }

  return Array.from(labels.values());
}

export function isCountryLabelLayer(layerId: string): boolean {
  const id = layerId.toLowerCase();
  return (
    id.includes("country-label") ||
    id.includes("country_label") ||
    (id.includes("country") && id.includes("label"))
  );
}
