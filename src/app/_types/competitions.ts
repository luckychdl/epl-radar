import { Area } from "./common";
import { Season } from "./standings";

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

/** GET /v4/competitions/{code} — 과거 시즌 목록을 함께 준다 */
export interface CompetitionDetailResponse {
  id: number;
  area: Area;
  name: string;
  code: string;
  type: string;
  emblem: string;
  currentSeason: Season;
  seasons: Season[];
}
