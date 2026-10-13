import { Area, CompetitionSummary } from "./common";
import { Season } from "./standings";

export interface ScorerPlayer {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  section: string | null;
  position: string | null;
  shirtNumber: number | null;
}

/** 득점 순위에 실려 오는 팀 요약. 순위표의 TeamSummary 보다 필드가 많다. */
export interface ScorerTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Scorer {
  player: ScorerPlayer;
  team: ScorerTeam;
  playedMatches: number;
  goals: number;
  /** 무료 플랜에서도 오지만 값이 비어 있을 수 있다. */
  assists: number | null;
  penalties: number | null;
}

export interface CompetitionScorersResponse {
  count: number;
  filters: {
    season?: number | string;
    limit?: number;
  };
  area?: Area;
  competition: CompetitionSummary;
  season: Season;
  scorers: Scorer[];
}
