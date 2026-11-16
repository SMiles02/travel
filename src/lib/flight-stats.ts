import { cities, type CityName } from "@/data/cities";
import type { FlightEntry } from "@/lib/flights-by-year";
import { flightCityLabel } from "@/lib/mapbox/flight-city-labels";

const COUNTRY_NAMES: Record<string, string> = {
  AE: "United Arab Emirates",
  CA: "Canada",
  CH: "Switzerland",
  DE: "Germany",
  FR: "France",
  GB: "United Kingdom",
  HR: "Croatia",
  IE: "Ireland",
  IN: "India",
  IS: "Iceland",
  IT: "Italy",
  NL: "Netherlands",
  QA: "Qatar",
  TR: "Turkey",
  US: "United States",
};

/** Great-circle distance in km between two [lng, lat] points. */
export function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type RankedName = {
  name: string;
  count: number;
};

export type YearStat = {
  year: string;
  flights: number;
  km: number;
};

export type RouteStat = {
  from: string;
  to: string;
  count: number;
  km: number;
};

export type LegStat = {
  from: string;
  to: string;
  km: number;
};

export type AirlineStat = {
  name: string;
  legs: number;
  km: number;
};

export type FlightStats = {
  flights: number;
  totalKm: number;
  averageKm: number;
  longest: LegStat | null;
  byYear: YearStat[];
  busiestYear: YearStat | null;
  cities: number;
  airports: number;
  countries: number;
  busiestCity: RankedName | null;
  busiestAirport: RankedName | null;
  topRoute: RouteStat | null;
  airlineCount: number;
  airlines: AirlineStat[];
  topAirlineByDistance: AirlineStat | null;
};

function countryName(code: string) {
  return COUNTRY_NAMES[code] ?? code;
}

function bump(counts: Map<string, number>, key: string) {
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

function topCount(counts: Map<string, number>): RankedName | null {
  let best: RankedName | null = null;
  for (const [name, count] of counts) {
    if (!best || count > best.count || (count === best.count && name < best.name)) {
      best = { name, count };
    }
  }
  return best;
}

export function getFlightStats(flights: FlightEntry[]): FlightStats {
  const cityCounts = new Map<string, number>();
  const airportCounts = new Map<string, number>();
  const countries = new Set<string>();
  const routeCounts = new Map<string, { from: string; to: string; count: number; km: number }>();
  const yearCounts = new Map<string, { flights: number; km: number }>();
  const airlineCounts = new Map<string, { legs: number; km: number }>();

  let totalKm = 0;
  let longest: LegStat | null = null;

  for (const flight of flights) {
    const km = haversineKm(flight.origin, flight.destination);
    totalKm += km;

    const originCity = flightCityLabel(flight.originName);
    const destinationCity = flightCityLabel(flight.destinationName);
    if (!longest || km > longest.km) {
      longest = { from: originCity, to: destinationCity, km };
    }

    bump(cityCounts, originCity);
    bump(cityCounts, destinationCity);
    bump(airportCounts, flight.originName);
    bump(airportCounts, flight.destinationName);

    const originCountry = cities[flight.originName as CityName]?.countryCode;
    const destinationCountry =
      flight.countryCode || cities[flight.destinationName as CityName]?.countryCode;
    if (originCountry) countries.add(countryName(originCountry));
    if (destinationCountry) countries.add(countryName(destinationCountry));

    const [from, to] =
      originCity < destinationCity
        ? [originCity, destinationCity]
        : [destinationCity, originCity];
    const routeId = `${from}→${to}`;
    const route = routeCounts.get(routeId);
    if (route) {
      route.count += 1;
      route.km += km;
    } else {
      routeCounts.set(routeId, { from, to, count: 1, km });
    }

    const year = yearCounts.get(flight.year) ?? { flights: 0, km: 0 };
    year.flights += 1;
    year.km += km;
    yearCounts.set(flight.year, year);

    const airlineName = flight.airline.trim();
    if (airlineName) {
      const airline = airlineCounts.get(airlineName) ?? { legs: 0, km: 0 };
      airline.legs += 1;
      airline.km += km;
      airlineCounts.set(airlineName, airline);
    }
  }

  const byYear = Array.from(yearCounts, ([year, stat]) => ({
    year,
    flights: stat.flights,
    km: stat.km,
  })).sort((a, b) => Number(a.year) - Number(b.year));

  let busiestYear: YearStat | null = null;
  for (const year of byYear) {
    if (
      !busiestYear ||
      year.flights > busiestYear.flights ||
      (year.flights === busiestYear.flights && year.km > busiestYear.km)
    ) {
      busiestYear = year;
    }
  }

  let topRoute: RouteStat | null = null;
  for (const route of routeCounts.values()) {
    if (
      !topRoute ||
      route.count > topRoute.count ||
      (route.count === topRoute.count && route.km > topRoute.km)
    ) {
      topRoute = route;
    }
  }

  const airlines = Array.from(airlineCounts, ([name, stat]) => ({
    name,
    legs: stat.legs,
    km: stat.km,
  })).sort((a, b) => b.km - a.km || b.legs - a.legs || a.name.localeCompare(b.name));

  const flightsCount = flights.length;

  return {
    flights: flightsCount,
    totalKm,
    averageKm: flightsCount === 0 ? 0 : totalKm / flightsCount,
    longest,
    byYear,
    busiestYear,
    cities: cityCounts.size,
    airports: airportCounts.size,
    countries: countries.size,
    busiestCity: topCount(cityCounts),
    busiestAirport: topCount(airportCounts),
    topRoute,
    airlineCount: airlines.length,
    airlines,
    topAirlineByDistance: airlines[0] ?? null,
  };
}
