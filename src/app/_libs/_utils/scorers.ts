import { Scorer } from "@/app/_types/scorers";

/**
 * 직전 시즌 연도. football-data 의 season 파라미터는 시작 연도를 쓴다.
 * (2025-08-15 시작 시즌 → 2025)
 */
export function getPreviousSeasonYear(startDate: string): number | null {
  const start = new Date(startDate);

  return Number.isNaN(start.getTime()) ? null : start.getFullYear() - 1;
}

/** 한 팀 소속 선수만. 득점 → 도움 순으로 이미 정렬돼 오지만 순서를 보장한다. */
export function getScorersOfTeam(scorers: Scorer[], teamId: number): Scorer[] {
  return scorers
    .filter((scorer) => scorer.team.id === teamId)
    .sort((a, b) => b.goals - a.goals || (b.assists ?? 0) - (a.assists ?? 0));
}

export interface ScorerTotals {
  goals: number;
  assists: number;
  players: number;
}

/** 목록에 잡힌 선수들의 합계. 상위 N명만 받은 값이라 팀 전체 득점과는 다르다. */
export function sumScorers(scorers: Scorer[]): ScorerTotals {
  return scorers.reduce(
    (totals, scorer) => ({
      goals: totals.goals + scorer.goals,
      assists: totals.assists + (scorer.assists ?? 0),
      players: totals.players + 1,
    }),
    { goals: 0, assists: 0, players: 0 },
  );
}

export interface SeasonOption {
  /** 시즌 시작 연도. URL 쿼리와 API season 파라미터에 같은 값을 쓴다. */
  year: number;
  /** "2025-26" */
  label: string;
  isCurrent: boolean;
}

interface SeasonLike {
  startDate: string;
}

/**
 * 무료 플랜이 실제로 열어주는 과거 시즌 수.
 * football-data 는 1888년까지 목록을 주지만 그보다 이전을 요청하면 403 이 온다.
 * (2026-08 기준 2023 시즌까지 200, 2015 시즌은 403)
 */
export const ARCHIVE_SEASON_LIMIT = 4;

/** 시즌 목록을 최신순 옵션으로 바꾼다. 형식이 깨진 항목은 버린다. */
export function toSeasonOptions(
  seasons: SeasonLike[],
  currentStartDate: string | undefined,
  limit = ARCHIVE_SEASON_LIMIT,
): SeasonOption[] {
  const currentYear = currentStartDate
    ? new Date(currentStartDate).getFullYear()
    : null;

  const years = seasons
    .map((season) => new Date(season.startDate).getFullYear())
    .filter((year) => !Number.isNaN(year));

  return [...new Set(years)]
    .sort((a, b) => b - a)
    .slice(0, limit)
    .map((year) => ({
      year,
      label: `${year}-${String((year + 1) % 100).padStart(2, "0")}`,
      isCurrent: year === currentYear,
    }));
}
