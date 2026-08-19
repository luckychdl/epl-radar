import { addDays, format, isValid, parse } from "date-fns";
import {
  API_DATE_FORMAT,
  DATE_PARAM_FORMAT,
  REVALIDATE,
} from "@/app/_constants/football";
import {
  SUPPORTED_LEAGUES,
  SUPPORTED_LEAGUE_CODES,
} from "@/app/_constants/leagues";
import { groupMatchesByLeague } from "@/app/_libs/_utils/match";
import { MatchesResponse } from "@/app/_types/matches";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";
import { footballServerFetch, RateLimitError } from "./footballServerFetch";

function resolveTargetDay(date?: string | null): Date {
  if (date) {
    const parsed = parse(date, DATE_PARAM_FORMAT, new Date());
    if (isValid(parsed)) return parsed;
  }

  return new Date();
}

/** ?date= 값이 비었거나 잘못된 형식이면 오늘 날짜로 대체한다. */
export function resolveTargetDate(date?: string | null): string {
  return format(resolveTargetDay(date), API_DATE_FORMAT);
}

/** 형식이 맞는 값만 통과시킨다. 클라이언트 폴링 쿼리에 그대로 재사용하기 위함이다. */
export function normalizeDateParam(date?: string | null): string | undefined {
  if (!date || !/^\d{8}$/.test(date)) return undefined;

  return isValid(parse(date, DATE_PARAM_FORMAT, new Date())) ? date : undefined;
}

export async function getTodayMatchesServer(
  date?: string | null,
): Promise<TodayMatchesResponse> {
  const day = resolveTargetDay(date);
  const dateFrom = format(day, API_DATE_FORMAT);
  // /v4/matches 의 dateTo 는 배타적이다. dateFrom 과 같게 주면 0건이 돌아온다.
  const dateTo = format(addDays(day, 1), API_DATE_FORMAT);

  try {
    // 리그별 8회 호출을 리스트 리소스 1회로 대체한다. 분당 10회 한도가 전제다.
    const data = await footballServerFetch<MatchesResponse>(
      `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&competitions=${SUPPORTED_LEAGUE_CODES}`,
      { revalidate: REVALIDATE.live },
    );

    return {
      date: dateFrom,
      leagues: groupMatchesByLeague(data.matches ?? [], SUPPORTED_LEAGUES),
    };
  } catch (error) {
    // 429 는 정상 시나리오이고 footballServerFetch 가 이미 기록했다. 그 외만 알린다.
    if (!(error instanceof RateLimitError)) {
      console.warn("[todayMatches] 조회 실패", error);
    }

    // 단일 호출이므로 부분 실패가 없다. 빈 배열을 돌려주고 화면에서 안내한다.
    return { date: dateFrom, leagues: [] };
  }
}
