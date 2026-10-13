import { format, isValid, parse } from "date-fns";
import {
  API_DATE_FORMAT,
  DATE_PARAM_FORMAT,
  REVALIDATE,
  SERVICE_UTC_OFFSET_HOURS,
} from "@/app/_constants/football";
import {
  SUPPORTED_LEAGUES,
  SUPPORTED_LEAGUE_CODES,
} from "@/app/_constants/leagues";
import { groupMatchesByLeague } from "@/app/_libs/_utils/match";
import {
  filterMatchesInWindow,
  getMatchDayWindow,
  getServiceDateParam,
} from "@/app/_libs/_utils/matchDay";
import { MatchesResponse } from "@/app/_types/matches";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";
import { footballServerFetch, RateLimitError } from "./footballServerFetch";

/** ?date= 값이 비었거나 잘못된 형식이면 서비스 시간대 기준 오늘로 대체한다. */
function resolveDateParam(date?: string | null): string {
  return (
    normalizeDateParam(date) ??
    getServiceDateParam(new Date(), SERVICE_UTC_OFFSET_HOURS)
  );
}

/** 형식이 맞는 값만 통과시킨다. 클라이언트 폴링 쿼리에 그대로 재사용하기 위함이다. */
export function normalizeDateParam(date?: string | null): string | undefined {
  if (!date || !/^\d{8}$/.test(date)) return undefined;

  return isValid(parse(date, DATE_PARAM_FORMAT, new Date())) ? date : undefined;
}

export async function getTodayMatchesServer(
  date?: string | null,
): Promise<TodayMatchesResponse> {
  const dateParam = resolveDateParam(date);
  const window = getMatchDayWindow(dateParam, SERVICE_UTC_OFFSET_HOURS);
  const targetDate = format(
    parse(dateParam, DATE_PARAM_FORMAT, new Date()),
    API_DATE_FORMAT,
  );

  try {
    // 리그별 8회 호출을 리스트 리소스 1회로 대체한다. 분당 10회 한도가 전제다.
    const data = await footballServerFetch<MatchesResponse>(
      `/matches?dateFrom=${window.dateFrom}&dateTo=${window.dateTo}&competitions=${SUPPORTED_LEAGUE_CODES}`,
      { revalidate: REVALIDATE.live },
    );

    // API 는 UTC 날짜로만 자른다. 그대로 쓰면 한국시간 다음 날 새벽 경기가 오늘 목록에 섞인다.
    const matches = filterMatchesInWindow(data.matches ?? [], window);

    return {
      date: targetDate,
      leagues: groupMatchesByLeague(matches, SUPPORTED_LEAGUES),
    };
  } catch (error) {
    // 429 는 정상 시나리오이고 footballServerFetch 가 이미 기록했다. 그 외만 알린다.
    if (!(error instanceof RateLimitError)) {
      console.warn("[todayMatches] 조회 실패", error);
    }

    // 단일 호출이므로 부분 실패가 없다. 빈 배열을 돌려주고 화면에서 안내한다.
    return { date: targetDate, leagues: [] };
  }
}
