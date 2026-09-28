import { TeamSummary } from "./common";

export interface PredictedScore {
  home: number;
  away: number;
}

export type PredictionOutcome = "HOME" | "DRAW" | "AWAY";

/** exact: 스코어 적중 / outcome: 승부만 적중 / miss: 빗나감 */
export type PredictionGrade = "exact" | "outcome" | "miss";

export interface AiPrediction {
  /** 홈 승·무·원정 승 확률(%). 합은 항상 100. */
  homeWin: number;
  draw: number;
  awayWin: number;
  score: PredictedScore;
  reason: string;
}

/**
 * 채점과 기록 화면을 그리는 데 필요한 만큼만 저장한다.
 * 10일 창을 벗어난 경기도 추가 요청 없이 기록에 남기기 위해 스냅샷을 둔다.
 */
export interface PredictionMatchSnapshot {
  id: number;
  utcDate: string;
  competitionCode: string;
  homeTeam: Pick<TeamSummary, "id" | "shortName" | "crest">;
  awayTeam: Pick<TeamSummary, "id" | "shortName" | "crest">;
}

export interface PredictionEntry {
  match: PredictionMatchSnapshot;
  user?: PredictedScore & { savedAt: string };
  /** 사용자가 열어본 AI 예측. 경기 후 AI 성적을 매기려면 로컬에도 남아 있어야 한다. */
  ai?: AiPrediction;
  result?: PredictedScore;
}

export interface PredictionRecord {
  total: number;
  exact: number;
  outcome: number;
  points: number;
  /** 승부 적중률(%). 채점된 예측이 없으면 null. */
  hitRate: number | null;
}

export interface PredictionSummary {
  user: PredictionRecord;
  ai: PredictionRecord;
  /** 나와 AI 가 모두 예측한 경기만 비교한 맞대결 */
  headToHead: { win: number; draw: number; lose: number };
}
