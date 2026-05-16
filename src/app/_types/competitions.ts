export interface Area {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}
export interface Competition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
  plan: string;
  currentSeason?: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
  };
  area: Area;
}
export interface CompetitionsResponse {
  count: number;
  competitions: Competition[];
}
