export const airlines = {
  AerLingus: "Aer Lingus",
  AirFrance: "Air France",
  CroatiaAirlines: "Croatia Airlines",
  Emirates: "Emirates",
  Etihad: "Etihad",
  IndiGo: "IndiGo",
  JetAirways: "Jet Airways",
  KLM: "KLM",
  QatarAirways: "Qatar Airways",
  Ryanair: "Ryanair",
  SkyviewAirways: "Skyview Airways",
  SpiceJet: "SpiceJet",
  Swiss: "Swiss International Air Lines",
  TurkishAirlines: "Turkish Airlines",
  WowAir: "WOW Air",
} as const;

export type Airline = (typeof airlines)[keyof typeof airlines];
