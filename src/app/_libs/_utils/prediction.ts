import { format } from "date-fns";
import { MatchStatus } from "@/app/_types/common";
import { Match } from "@/app/_types/matches";
import {
  AiPrediction,
  PredictedScore,
  PredictionEntry,
  PredictionGrade,
  PredictionMatchSnapshot,
  PredictionOutcome,
  PredictionRecord,
  PredictionSummary,
} from "@/app/_types/predictions";
import { isFinishedMatch } from "./match";

export const MAX_PREDICTED_GOALS = 9;

const GRADE_POINTS: Record<PredictionGrade, number> = {
  exact: 3,
  outcome: 1,
  miss: 0,
};

const OPEN_STATUSES: MatchStatus[] = ["SCHEDULED", "TIMED"];

/**
 * 킥오프 전 예정 경기만 예측을 받는다.
 * 무료 플랜은 상태 갱신이 늦어 킥오프가 지나도 TIMED 로 남을 수 있으므로 시각도 함께 본다.
 */
export function isPredictionOpen(
  match: Pick<Match, "status" | "utcDate">,
  now: Date,
) {
  return (
    OPEN_STATUSES.includes(match.status) &&
    new Date(match.utcDate).getTime() > now.getTime()
  );
}

export function clampGoals(value: number) {
  if (!Number.isFinite(value)) return 0;

  return Math.min(MAX_PREDICTED_GOALS, Math.max(0, Math.round(value)));
}

export function getScoreOutcome({ home, away }: PredictedScore): PredictionOutcome {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";

  return "DRAW";
}

export function gradePrediction(
  predicted: PredictedScore,
  result: PredictedScore,
): PredictionGrade {
  if (predicted.home === result.home && predicted.away === result.away) {
    return "exact";
  }

  return getScoreOutcome(predicted) === getScoreOutcome(result)
    ? "outcome"
    : "miss";
}

export function getGradePoints(grade: PredictionGrade) {
  return GRADE_POINTS[grade];
}

/** AI 가 가장 높게 본 결과. 동률이면 무승부를 우선해 한쪽으로 몰지 않는다. */
export function getFavoredOutcome(
  prediction: Pick<AiPrediction, "homeWin" | "draw" | "awayWin">,
): PredictionOutcome {
  const { homeWin, draw, awayWin } = prediction;

  if (draw >= homeWin && draw >= awayWin) return "DRAW";

  return homeWin >= awayWin ? "HOME" : "AWAY";
}

export function toPredictionSnapshot(match: Match): PredictionMatchSnapshot {
  const pickTeam = ({ id, shortName, crest }: Match["homeTeam"]) => ({
    id,
    shortName,
    crest,
  });

  return {
    id: match.id,
    utcDate: match.utcDate,
    competitionCode: match.competition.code,
    homeTeam: pickTeam(match.homeTeam),
    awayTeam: pickTeam(match.awayTeam),
  };
}

/** 종료된 경기의 최종 스코어. 채점할 수 없는 상태면 null. */
export function getFinalScore(match: Match): PredictedScore | null {
  const { home, away } = match.score.fullTime;

  if (!isFinishedMatch(match.status) || home === null || away === null) {
    return null;
  }

  return { home, away };
}

/**
 * 확률 세 개를 합 100 인 정수로 맞춘다.
 * 반올림 오차는 가장 큰 값에 몰아 넣어 순위가 뒤바뀌지 않게 한다.
 */
export function normalizeProbabilities(
  homeWin: number,
  draw: number,
  awayWin: number,
): Pick<AiPrediction, "homeWin" | "draw" | "awayWin"> | null {
  const values = [homeWin, draw, awayWin].map((value) =>
    Number.isFinite(value) ? Math.max(0, value) : 0,
  );
  const sum = values.reduce((acc, value) => acc + value, 0);

  if (sum <= 0) return null;

  const scaled = values.map((value) => Math.round((value / sum) * 100));
  const diff = 100 - scaled.reduce((acc, value) => acc + value, 0);
  const largest = scaled.indexOf(Math.max(...scaled));
  scaled[largest] += diff;

  return { homeWin: scaled[0], draw: scaled[1], awayWin: scaled[2] };
}

const REASON_MAX_LENGTH = 300;

/** 모델 출력은 스키마를 지켜도 값 범위까지 보장하지 않는다. 화면에 올리기 전에 한 번 더 맞춘다. */
export function normalizeAiPrediction(raw: unknown): AiPrediction | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const probabilities = normalizeProbabilities(
    Number(record.homeWin),
    Number(record.draw),
    Number(record.awayWin),
  );
  const reason = typeof record.reason === "string" ? record.reason.trim() : "";

  if (!probabilities || reason.length === 0) return null;

  return {
    ...probabilities,
    score: {
      home: clampGoals(Number(record.homeGoals)),
      away: clampGoals(Number(record.awayGoals)),
    },
    reason: reason.slice(0, REASON_MAX_LENGTH),
  };
}

function emptyRecord(): PredictionRecord {
  return { total: 0, exact: 0, outcome: 0, points: 0, hitRate: null };
}

function addGrade(record: PredictionRecord, grade: PredictionGrade) {
  record.total += 1;
  record.points += getGradePoints(grade);
  if (grade === "exact") record.exact += 1;
  if (grade !== "miss") record.outcome += 1;
}

function withHitRate(record: PredictionRecord): PredictionRecord {
  return {
    ...record,
    hitRate:
      record.total > 0 ? Math.round((record.outcome / record.total) * 100) : null,
  };
}

/** 결과가 확정된 경기만 집계한다. outcome 은 스코어 적중을 포함한 승부 적중 수다. */
export function summarizePredictions(
  entries: PredictionEntry[],
): PredictionSummary {
  const user = emptyRecord();
  const ai = emptyRecord();
  const headToHead = { win: 0, draw: 0, lose: 0 };

  for (const entry of entries) {
    if (!entry.result) continue;

    const userGrade = entry.user && gradePrediction(entry.user, entry.result);
    const aiGrade = entry.ai && gradePrediction(entry.ai.score, entry.result);

    if (userGrade) addGrade(user, userGrade);
    if (aiGrade) addGrade(ai, aiGrade);

    if (userGrade && aiGrade) {
      const diff = getGradePoints(userGrade) - getGradePoints(aiGrade);
      if (diff > 0) headToHead.win += 1;
      else if (diff < 0) headToHead.lose += 1;
      else headToHead.draw += 1;
    }
  }

  return { user: withHitRate(user), ai: withHitRate(ai), headToHead };
}

/** 최근 킥오프가 위로 오도록 정렬한다. */
export function sortEntriesByKickOffDesc(entries: PredictionEntry[]) {
  return [...entries].sort(
    (a, b) =>
      new Date(b.match.utcDate).getTime() - new Date(a.match.utcDate).getTime(),
  );
}

/**
 * 저장 개수 상한을 넘으면 킥오프가 오래된 기록부터 버린다.
 * localStorage 는 도메인당 용량이 작아 무한히 쌓을 수 없다.
 */
export function pruneEntries(
  entries: Record<number, PredictionEntry>,
  limit: number,
): Record<number, PredictionEntry> {
  const list = Object.values(entries);

  if (list.length <= limit) return entries;

  return Object.fromEntries(
    sortEntriesByKickOffDesc(list)
      .slice(0, limit)
      .map((entry) => [entry.match.id, entry]),
  );
}

/** 이미 받아온 경기 목록으로 결과가 비어 있는 예측을 채운다. 바뀐 게 없으면 null. */
export function settleEntries(
  entries: Record<number, PredictionEntry>,
  matches: Match[],
): Record<number, PredictionEntry> | null {
  let next: Record<number, PredictionEntry> | null = null;

  for (const match of matches) {
    const entry = entries[match.id];
    if (!entry || entry.result) continue;

    const result = getFinalScore(match);
    if (!result) continue;

    next ??= { ...entries };
    next[match.id] = { ...entry, result };
  }

  return next;
}

export interface MatchDayGroup {
  /** 로컬 기준 yyyy-MM-dd */
  day: string;
  matches: Match[];
}

/**
 * 아직 예측할 수 있는 경기를 로컬 날짜별로 묶어 가까운 N일만 남긴다.
 * 10일 창 전체를 펼치면 수십 경기가 한 화면에 쌓여 정작 이번 주말 경기를 찾기 어렵다.
 */
export function groupOpenMatchesByDay(
  matches: Match[],
  now: Date,
  maxDays: number,
): MatchDayGroup[] {
  const groups = new Map<string, Match[]>();

  const open = matches
    .filter((match) => isPredictionOpen(match, now))
    .sort(
      (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime(),
    );

  for (const match of open) {
    const day = format(new Date(match.utcDate), "yyyy-MM-dd");
    const group = groups.get(day);

    if (group) {
      group.push(match);
    } else {
      if (groups.size >= maxDays) break;
      groups.set(day, [match]);
    }
  }

  return [...groups].map(([day, dayMatches]) => ({ day, matches: dayMatches }));
}
