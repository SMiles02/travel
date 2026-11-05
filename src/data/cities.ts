export type Coordinate = [number, number];

export type City = {
  /** [longitude, latitude] */
  coordinates: Coordinate;
  /** ISO 3166-1 alpha-2 country code the city is in */
  countryCode: string;
};

export const cities = {
  "Abu Dhabi": { coordinates: [54.3773, 24.4539], countryCode: "AE" },
  Amritsar: { coordinates: [74.8723, 31.634], countryCode: "IN" },
  Amsterdam: { coordinates: [4.9041, 52.3676], countryCode: "NL" },
  Antalya: { coordinates: [30.7133, 36.8969], countryCode: "TR" },
  Bangalore: { coordinates: [77.5946, 12.9716], countryCode: "IN" },
  Cork: { coordinates: [-8.4756, 51.8985], countryCode: "IE" },
  Doha: { coordinates: [51.531, 25.2736], countryCode: "QA" },
  Dubai: { coordinates: [55.2708, 25.2048], countryCode: "AE" },
  Dublin: { coordinates: [-6.2603, 53.3498], countryCode: "IE" },
  Frankfurt: { coordinates: [8.6821, 50.1109], countryCode: "DE" },
  Geneva: { coordinates: [6.1432, 46.2044], countryCode: "CH" },
  Houston: { coordinates: [-95.3698, 29.7604], countryCode: "US" },
  Keflavik: { coordinates: [-22.6056, 63.985], countryCode: "IS" },
  London: { coordinates: [-0.1278, 51.5074], countryCode: "GB" },
  "London Gatwick": { coordinates: [-0.1903, 51.1537], countryCode: "GB" },
  "London Heathrow": { coordinates: [-0.4543, 51.47], countryCode: "GB" },
  "London Stansted": { coordinates: [0.2352, 51.886], countryCode: "GB" },
  Manchester: { coordinates: [-2.2426, 53.4808], countryCode: "GB" },
  Mumbai: { coordinates: [72.8777, 19.076], countryCode: "IN" },
  Munich: { coordinates: [11.582, 48.1351], countryCode: "DE" },
  "New Delhi": { coordinates: [77.209, 28.6139], countryCode: "IN" },
  Paris: { coordinates: [2.3522, 48.8566], countryCode: "FR" },
  Pisa: { coordinates: [10.4017, 43.7228], countryCode: "IT" },
  "San Francisco": { coordinates: [-122.4194, 37.7749], countryCode: "US" },
  Toronto: { coordinates: [-79.3832, 43.6532], countryCode: "CA" },
  Zadar: { coordinates: [15.3467, 44.1194], countryCode: "HR" },
  Zagreb: { coordinates: [15.9819, 45.815], countryCode: "HR" },
  Zurich: { coordinates: [8.5417, 47.3769], countryCode: "CH" },
} satisfies Record<string, City>;

export type CityName = keyof typeof cities;
