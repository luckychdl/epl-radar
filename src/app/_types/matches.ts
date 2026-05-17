export interface MatchArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

export interface MatchCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface MatchScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;

  fullTime: {
    home: number | null;
    away: number | null;
  };

  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface Match {
  id: number;

  utcDate: string;

  status: string;

  matchday: number;

  stage: string;

  group: string | null;

  lastUpdated: string;

  area: MatchArea;

  competition: MatchCompetition;

  homeTeam: MatchTeam;

  awayTeam: MatchTeam;

  score: MatchScore;
}

export interface CompetitionMatchesResponse {
  filters: {
    status?: string;
  };

  resultSet: {
    count: number;

    first: string;

    last: string;
  };

  competition: MatchCompetition;

  matches: Match[];
}
