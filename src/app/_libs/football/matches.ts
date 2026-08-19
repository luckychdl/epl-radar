import { addDays, format, subDays } from "date-fns";
import { API_DATE_FORMAT, REVALIDATE } from "@/app/_constants/football";
import { SUPPORTED_LEAGUE_CODES } from "@/app/_constants/leagues";
import {
  CompetitionMatchesResponse,
  MatchesResponse,
} from "@/app/_types/matches";
import { footballServerFetch } from "./footballServerFetch";

/** /v4/matches 는 기간을 10일로 제한한다 (초과 시 400). */
const MATCH_WINDOW_DAYS = 10;

function getWindowMatches(from: Date, to: Date) {
  return footballServerFetch<MatchesResponse>(
    `/matches?dateFrom=${format(from, API_DATE_FORMAT)}` +
      `&dateTo=${format(to, API_DATE_FORMAT)}` +
      `&competitions=${SUPPORTED_LEAGUE_CODES}`,
    { revalidate: REVALIDATE.standard },
  );
}

/**
 * 최근 결과 창. 즐겨찾기 팀 수와 무관하게 항상 1회만 호출한다.
 * 팀별로 따로 부르면 즐겨찾기를 늘릴수록 분당 한도를 잡아먹는다.
 */
export function getRecentWindowMatchesServer() {
  const today = new Date();

  // dateTo 는 배타적이므로 오늘까지 포함하려면 +1일. 기간은 정확히 10일.
  return getWindowMatches(
    subDays(today, MATCH_WINDOW_DAYS - 1),
    addDays(today, 1),
  );
}

/** 예정 경기 창. 동일하게 항상 1회. */
export function getUpcomingWindowMatchesServer() {
  const today = new Date();

  return getWindowMatches(today, addDays(today, MATCH_WINDOW_DAYS));
}

export function getMatchesRecentServer(code: string, season?: number) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=FINISHED` +
      (season ? `&season=${season}` : ""),
    { revalidate: REVALIDATE.standard },
  );
}

export function getMatchesScheduledServer(code: string, season?: number) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=SCHEDULED` +
      (season ? `&season=${season}` : ""),
    { revalidate: REVALIDATE.standard },
  );
}
