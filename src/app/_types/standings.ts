import { Area, CompetitionSummary, TeamSummary } from "./common";

export interface TableRow {
  position: number;
  team: TeamSummary;
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface Standing {
  stage: string;
  type: string;
  group: string | null;
  table: TableRow[];
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
  winner: TeamSummary | null;
}

export interface CompetitionStandingsResponse {
  area: Area;
  competition: CompetitionSummary;
  season: Season;
  standings: Standing[];
}
