export interface Religion {
  id: number;
  name: string;
  code: string;
}

export interface ReligionResponse {
  religions: Religion[];
}
