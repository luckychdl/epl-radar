import { TeamSummary } from "@/app/_types/common";
import { Match } from "@/app/_types/matches";
import { MatchOutcome } from "./match";

const WIN_POINTS = 3;
const DRAW_POINTS = 1;

export interface MatchdayPosition {
  matchday: number;
  position: number;
  points: number;
}

export interface TeamPositionHistory {
  team: TeamSummary;
  history: MatchdayPosition[];
}

interface AccumulatedRow {
  team: TeamSummary;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface ScoredMatch extends Match {
  matchday: number;
}

/** 결과와 라운드가 모두 확정된 경기만 계산에 넣는다. */
function isScored(match: Match): match is ScoredMatch {
  return (
    match.matchday !== undefined &&
    match.score.fullTime.home !== null &&
    match.score.fullTime.away !== null
  );
}

/**
 * football-data 는 리그별 세부 타이브레이커를 주지 않는다.
 * 승점 → 득실차 → 다득점 → 이름 순으로 근사한다.
 */
function compareRows(a: AccumulatedRow, b: AccumulatedRow) {
  if (b.points !== a.points) return b.points - a.points;

  const aDiff = a.goalsFor - a.goalsAgainst;
  const bDiff = b.goalsFor - b.goalsAgainst;
  if (bDiff !== aDiff) return bDiff - aDiff;

  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

  return a.team.name.localeCompare(b.team.name);
}

function getRow(totals: Map<number, AccumulatedRow>, team: TeamSummary) {
  const existing = totals.get(team.id);
  if (existing) return existing;

  const created: AccumulatedRow = {
    team,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
  totals.set(team.id, created);

  return created;
}

function applyResult(totals: Map<number, AccumulatedRow>, match: ScoredMatch) {
  const home = getRow(totals, match.homeTeam);
  const away = getRow(totals, match.awayTeam);
  const homeGoals = match.score.fullTime.home ?? 0;
  const awayGoals = match.score.fullTime.away ?? 0;

  home.goalsFor += homeGoals;
  home.goalsAgainst += awayGoals;
  away.goalsFor += awayGoals;
  away.goalsAgainst += homeGoals;

  if (homeGoals > awayGoals) home.points += WIN_POINTS;
  else if (homeGoals < awayGoals) away.points += WIN_POINTS;
  else {
    home.points += DRAW_POINTS;
    away.points += DRAW_POINTS;
  }
}

/**
 * 전체 경기 결과로 라운드별 순위를 직접 계산한다.
 * 무료 플랜은 과거 순위 스냅샷을 주지 않으므로 계산으로 만들어낸다.
 */
export function buildPositionHistory(matches: Match[]): TeamPositionHistory[] {
  const scored = matches.filter(isScored);

  if (scored.length === 0) return [];

  const matchdays = [...new Set(scored.map((match) => match.matchday))].sort(
    (a, b) => a - b,
  );
  const totals = new Map<number, AccumulatedRow>();
  const histories = new Map<number, MatchdayPosition[]>();

  for (const matchday of matchdays) {
    for (const match of scored) {
      if (match.matchday === matchday) applyResult(totals, match);
    }

    [...totals.values()].sort(compareRows).forEach((row, index) => {
      const history = histories.get(row.team.id) ?? [];
      history.push({ matchday, position: index + 1, points: row.points });
      histories.set(row.team.id, history);
    });
  }

  return [...totals.values()]
    .sort(compareRows)
    .map((row) => ({ team: row.team, history: histories.get(row.team.id) ?? [] }));
}

export interface FormStreak {
  outcome: MatchOutcome;
  count: number;
}

/** 가장 최근 경기부터 같은 결과가 몇 번 이어졌는지. outcomes 는 오래된 순. */
export function getFormStreak(outcomes: MatchOutcome[]): FormStreak | null {
  if (outcomes.length === 0) return null;

  const latest = outcomes[outcomes.length - 1];
  let count = 0;

  for (let index = outcomes.length - 1; index >= 0; index -= 1) {
    if (outcomes[index] !== latest) break;
    count += 1;
  }

  return { outcome: latest, count };
}

const STREAK_LABEL: Record<MatchOutcome, [single: string, multiple: string]> = {
  W: ["1승", "연승"],
  D: ["1무", "연무"],
  L: ["1패", "연패"],
};

export function describeStreak(streak: FormStreak | null) {
  if (!streak) return null;

  const [single, multiple] = STREAK_LABEL[streak.outcome];

  return streak.count === 1 ? single : `${streak.count}${multiple}`;
}

export interface RemainingDifficulty {
  /** 0(쉬움) ~ 1(어려움) */
  score: number;
  averageOpponentPosition: number;
  opponentCount: number;
}

/**
 * 잔여 일정 난이도. 상대의 현재 순위 평균을 0~1 로 정규화한다.
 * 순위가 높은(숫자가 작은) 상대가 많을수록 1 에 가까워진다.
 */
export function getRemainingDifficulty(
  scheduled: Match[],
  teamId: number,
  positionByTeam: Map<number, number>,
  totalTeams: number,
): RemainingDifficulty | null {
  if (totalTeams < 2) return null;

  // 시즌 초에는 모든 팀이 같은 순위로 내려온다. 이때 평균 순위는 의미가 없다.
  if (new Set(positionByTeam.values()).size < 2) return null;

  const opponentPositions = scheduled
    .map((match) => {
      if (match.homeTeam.id === teamId) return match.awayTeam.id;
      if (match.awayTeam.id === teamId) return match.homeTeam.id;

      return null;
    })
    .filter((opponentId): opponentId is number => opponentId !== null)
    .map((opponentId) => positionByTeam.get(opponentId))
    .filter((position): position is number => position !== undefined);

  if (opponentPositions.length === 0) return null;

  const averageOpponentPosition =
    opponentPositions.reduce((sum, position) => sum + position, 0) /
    opponentPositions.length;

  return {
    score: 1 - (averageOpponentPosition - 1) / (totalTeams - 1),
    averageOpponentPosition,
    opponentCount: opponentPositions.length,
  };
}
