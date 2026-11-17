import flights from "@/data/flights";
import { cities, type CityName, type Coordinate } from "@/data/cities";

/** Collapse airport endpoints onto a single city label. */
const LABEL_CITY: Partial<Record<CityName, CityName>> = {
  "Dubai International": "Dubai",
  "Houston Intercontinental": "Houston",
  "London Gatwick": "London",
  "London Heathrow": "London",
  "London Stansted": "London",
  "Paris Charles de Gaulle": "Paris",
  "Toronto Pearson": "Toronto",
};

/** London has three airports, so the map names each one where the route ends. */
const LONDON_AIRPORT_LABEL: Partial<Record<CityName, string>> = {
  "London Gatwick": "Gatwick",
  "London Heathrow": "Heathrow",
  "London Stansted": "Stansted",
};

/** City shown for an airport endpoint, or the name itself when it is already a city. */
export function flightCityLabel(name: string): string {
  return LABEL_CITY[name as CityName] ?? name;
}

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
        const airportLabel = LONDON_AIRPORT_LABEL[endpoint as CityName];
        if (airportLabel) {
          const airport = cities[endpoint as CityName];
          if (airport && !labels.has(endpoint)) {
            labels.set(endpoint, {
              name: airportLabel,
              coordinates: airport.coordinates,
            });
          }
          continue;
        }

        const cityName = flightCityLabel(endpoint) as CityName;
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
