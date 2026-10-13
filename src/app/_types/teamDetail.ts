import { Area, CompetitionSummary } from "./common";

export interface TeamCoach {
  id: number;
  firstName: string | null;
  lastName: string | null;
  name: string;
  dateOfBirth: string;
  nationality: string;
}

export interface TeamPlayer {
  id: number;
  name: string;
  position: string;
  dateOfBirth: string;
  nationality: string;
}

export interface TeamDetailResponse {
  id: number;
  area: Area;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  runningCompetitions: CompetitionSummary[];
  coach: TeamCoach;
  squad: TeamPlayer[];
  lastUpdated: string;
}
