import { REVALIDATE } from "@/app/_constants/football";
import { getPreviousSeasonYear } from "@/app/_libs/_utils/scorers";
import { CompetitionScorersResponse } from "@/app/_types/scorers";
import { footballServerFetch } from "./footballServerFetch";

/** 한 번에 받아두고 팀별 필터는 코드에서 한다. 20개 팀을 모두 덮는 크기. */
export const SCORER_LIMIT = 100;

export interface ScorersResult {
  data: CompetitionScorersResponse;
  /** 진행 중인 시즌 기록이면 참. 거짓이면 직전 시즌으로 되돌아간 결과다. */
  isCurrentSeason: boolean;
}

function fetchScorers(code: string, season?: number) {
  return footballServerFetch<CompetitionScorersResponse>(
    `/competitions/${code}/scorers?limit=${SCORER_LIMIT}` +
      (season ? `&season=${season}` : ""),
    { revalidate: REVALIDATE.standard },
  );
}

/**
 * 대회 득점 순위.
 * 개막 직후에는 기록이 비어 화면이 통째로 빈다. 그때만 직전 시즌으로 한 번 되돌아본다.
 * 최악의 경우에도 대회당 2회이고, ISR 캐시(10분)가 동시 접속자를 흡수한다.
 */
export async function getCompetitionScorersServer(
  code: string,
  season?: number,
): Promise<ScorersResult> {
  // 과거 시즌을 명시적으로 고른 경우에는 폴백 없이 그 시즌만 본다.
  if (season) {
    return { data: await fetchScorers(code, season), isCurrentSeason: false };
  }

  const current = await fetchScorers(code);

  if (current.scorers.length > 0) {
    return { data: current, isCurrentSeason: true };
  }

  const previousSeason = getPreviousSeasonYear(current.season.startDate);

  if (previousSeason === null) {
    return { data: current, isCurrentSeason: true };
  }

  return {
    data: await fetchScorers(code, previousSeason),
    isCurrentSeason: false,
  };
}
