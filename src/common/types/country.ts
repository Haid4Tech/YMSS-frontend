export interface Country {
  id: number;
  name: string;
  code: string;
  continent: string;
}

export interface CountryResponse {
  countries: Country[];
}

export interface ContinentResponse {
  continents: string[];
}
