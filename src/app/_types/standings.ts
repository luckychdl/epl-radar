export interface Standing {
  group: null;
  stage: string;
  table: Table[];
  type: string;
}
export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}
export interface Table {
  draw: number;
  form: null;
  goalDifference: number;
  goalsAgainst: number;
  goalsFor: number;
  lost: number;
  playedGames: number;
  points: number;
  position: number;
  team: Team;
  won: number;
}
export interface Area {
  code: string;
  flag: string;
  id: number;
  name: string;
}
export interface Competition {
  code: string;
  emblem: string;
  id: number;
  name: string;
  type: string;
}
export interface Season {
  currentMatchday: number;
  endDate: string;
  id: number;
  startDate: string;
  winner: null;
}

export interface CompetitionStandingsResponse {
  area: Area;
  competition: Competition;
  season: Season;
  standings: Standing[];
}
