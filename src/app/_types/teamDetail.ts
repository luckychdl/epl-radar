export interface TeamArea {
  id: number;

  name: string;

  code: string;

  flag: string | null;
}

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

export interface TeamRunningCompetition {
  id: number;

  name: string;

  code: string;

  type: string;

  emblem: string;
}

export interface TeamDetailResponse {
  id: number;

  area: TeamArea;

  name: string;

  shortName: string;

  tla: string;

  crest: string;

  address: string;

  website: string;

  founded: number;

  clubColors: string;

  venue: string;

  runningCompetitions: TeamRunningCompetition[];

  coach: TeamCoach;

  squad: TeamPlayer[];

  lastUpdated: string;
}
