export type Coordinate = [number, number];

export type City = {
  /** [longitude, latitude] */
  coordinates: Coordinate;
  /** ISO 3166-1 alpha-2 country code the city is in */
  countryCode: string;
};

export const cities = {
  "Abu Dhabi": { coordinates: [54.6511, 24.433], countryCode: "AE" },
  Amritsar: { coordinates: [74.7973, 31.7096], countryCode: "IN" },
  Amsterdam: { coordinates: [4.7683, 52.3105], countryCode: "NL" },
  Antalya: { coordinates: [30.8005, 36.8987], countryCode: "TR" },
  Bangalore: { coordinates: [77.7063, 13.1986], countryCode: "IN" },
  Cork: { coordinates: [-8.4911, 51.8413], countryCode: "IE" },
  Doha: { coordinates: [51.6081, 25.2731], countryCode: "QA" },
  Dubai: { coordinates: [55.3644, 25.2532], countryCode: "AE" },
  "Dubai International": { coordinates: [55.3644, 25.2532], countryCode: "AE" },
  Dublin: { coordinates: [-6.2701, 53.4213], countryCode: "IE" },
  Frankfurt: { coordinates: [8.5622, 50.0379], countryCode: "DE" },
  Geneva: { coordinates: [6.109, 46.2381], countryCode: "CH" },
  Houston: { coordinates: [-95.3414, 29.9902], countryCode: "US" },
  "Houston Intercontinental": {
    coordinates: [-95.3414, 29.9902],
    countryCode: "US",
  },
  Istanbul: { coordinates: [28.7425, 41.2627], countryCode: "TR" },
  Keflavik: { coordinates: [-22.6056, 63.985], countryCode: "IS" },
  London: { coordinates: [-0.1278, 51.5074], countryCode: "GB" },
  "London Gatwick": { coordinates: [-0.1903, 51.1537], countryCode: "GB" },
  "London Heathrow": { coordinates: [-0.4543, 51.47], countryCode: "GB" },
  "London Stansted": { coordinates: [0.2352, 51.886], countryCode: "GB" },
  Manchester: { coordinates: [-2.275, 53.3537], countryCode: "GB" },
  Mumbai: { coordinates: [72.8679, 19.0896], countryCode: "IN" },
  Munich: { coordinates: [11.7861, 48.3538], countryCode: "DE" },
  "New Delhi": { coordinates: [77.1031, 28.5562], countryCode: "IN" },
  Paris: { coordinates: [2.5707, 49.004], countryCode: "FR" },
  "Paris Charles de Gaulle": {
    coordinates: [2.5707, 49.004],
    countryCode: "FR",
  },
  Pisa: { coordinates: [10.3927, 43.6839], countryCode: "IT" },
  "San Francisco": { coordinates: [-122.379, 37.6213], countryCode: "US" },
  Toronto: { coordinates: [-79.6306, 43.6777], countryCode: "CA" },
  "Toronto Pearson": { coordinates: [-79.6306, 43.6777], countryCode: "CA" },
  Zadar: { coordinates: [15.3467, 44.1083], countryCode: "HR" },
  Zagreb: { coordinates: [16.0688, 45.7429], countryCode: "HR" },
  Zurich: { coordinates: [8.5555, 47.4582], countryCode: "CH" },
} satisfies Record<string, City>;

export type CityName = keyof typeof cities;
