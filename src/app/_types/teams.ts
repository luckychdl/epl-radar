export interface TeamMatchesResponse {
  resultSet: {
    count: number;
  };
  matches: Match[];
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}
