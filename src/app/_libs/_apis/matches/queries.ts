import { useQuery } from "@tanstack/react-query";
import { MATCH_POLLING_INTERVAL_MS } from "@/app/_constants/football";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";
import { getTodayMatches } from "./apis";

export const todayMatchesQueryKey = (date?: string) =>
  ["todayMatches", date ?? "today"] as const;

interface Options {
  date?: string;
  /** 서버 컴포넌트가 이미 받아온 데이터. 최초 렌더에서 추가 요청이 나가지 않게 한다. */
  initialData: TodayMatchesResponse;
  /** 평가 시점마다 폴링 간격을 결정한다. false 면 폴링하지 않는다. */
  resolveRefetchInterval: (data?: TodayMatchesResponse) => number | false;
}

export function useTodayMatches({
  date,
  initialData,
  resolveRefetchInterval,
}: Options) {
  return useQuery({
    queryKey: todayMatchesQueryKey(date),
    queryFn: () => getTodayMatches(date),
    initialData,
    // 서버 캐시 주기 안에서는 다시 물어도 같은 응답이라 요청을 아낀다.
    staleTime: MATCH_POLLING_INTERVAL_MS,
    // 포그라운드 복귀 처리는 useMatchPolling 이 조건부로 담당한다.
    refetchOnWindowFocus: false,
    refetchInterval: (query) => resolveRefetchInterval(query.state.data),
  });
}
