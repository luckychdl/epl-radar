import { Match } from "./matches";

export interface LeagueMatches {
  code: string;
  name: string;
  emblem?: string;
  matches: Match[];
}

export interface TodayMatchesResponse {
  /** yyyy-MM-dd */
  date: string;
  leagues: LeagueMatches[];
  /** 요청 한도 초과 등으로 데이터를 못 받은 상태. 프록시 라우트에서만 채운다. */
  degraded?: boolean;
}
