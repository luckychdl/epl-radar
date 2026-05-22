// _types/matches.ts

export interface LeagueMatches {
  code: string;

  name: string;

  emblem?: string;

  matches: Match[];
}

export interface TodayMatchesResponse {
  date: string;

  leagues: LeagueMatches[];
}
export interface Match {
  id: number;
  area: Area;
  utcDate: string;

  status: string;

  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };

  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };

  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}
export interface Area {
  code: string;
  flag: string;
  id: number;
  name: string;
}
