import {
  Area,
  CompetitionSummary,
  MatchScore,
  MatchStatus,
  TeamSummary,
} from "./common";

/** 모든 매치 관련 엔드포인트가 공유하는 단일 Match 스키마 */
export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday?: number;
  stage?: string;
  group?: string | null;
  lastUpdated?: string;
  area: Area;
  competition: CompetitionSummary;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  score: MatchScore;
}

export interface CompetitionMatchesResponse {
  filters: {
    status?: string;
    season?: string;
  };
  resultSet: {
    count: number;
    first?: string;
    last?: string;
  };
  competition: CompetitionSummary;
  matches: Match[];
}

/** GET /v4/matches — 여러 대회를 한 번에 받는 리스트 리소스 */
export interface MatchesResponse {
  filters: {
    dateFrom?: string;
    dateTo?: string;
    competitions?: string;
    permission?: string;
  };
  resultSet: {
    count: number;
    competitions?: string;
    first?: string;
    last?: string;
    played?: number;
  };
  matches: Match[];
}
