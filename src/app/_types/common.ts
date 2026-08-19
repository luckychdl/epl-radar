/** football-data.org v4 응답에서 반복적으로 등장하는 공통 스키마 */

export interface Area {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

export interface CompetitionSummary {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface TeamSummary {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export type MatchWinner = "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

export interface ScoreLine {
  home: number | null;
  away: number | null;
}

export interface MatchScore {
  winner: MatchWinner;
  duration?: string;
  fullTime: ScoreLine;
  halfTime?: ScoreLine;
}
