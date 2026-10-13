"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MATCH_POLLING_INTERVAL_MS } from "@/app/_constants/football";
import { useTodayMatches } from "@/app/_libs/_apis/matches/queries";
import { collectMatches, hasUpdatingMatch } from "@/app/_libs/_utils/match";
import { TodayMatchesResponse } from "@/app/_types/todayMatches";

function shouldKeepUpdating(data?: TodayMatchesResponse) {
  return hasUpdatingMatch(collectMatches(data?.leagues));
}

/**
 * 진행 중인 경기가 있고 탭이 보일 때만 경기 목록을 다시 받는다.
 * 백그라운드 탭에서 도는 폴링은 아무도 보지 않는 화면을 위해 한도를 태우는 것이다.
 */
export function useMatchPolling(
  date: string | undefined,
  initialData: TodayMatchesResponse,
) {
  const isVisibleRef = useRef(true);
  const [isVisible, setIsVisible] = useState(true);

  const resolveRefetchInterval = useCallback(
    (data?: TodayMatchesResponse) =>
      isVisibleRef.current && shouldKeepUpdating(data)
        ? MATCH_POLLING_INTERVAL_MS
        : (false as const),
    [],
  );

  const query = useTodayMatches({ date, initialData, resolveRefetchInterval });
  const { refetch, dataUpdatedAt } = query;

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      isVisibleRef.current = visible;
      setIsVisible(visible);

      // 백그라운드에서 폴링이 멈춰 있었으므로, 화면이 캐시 주기보다 오래됐을 때만
      // 간격을 기다리지 않고 즉시 한 번 맞춘다. 탭 전환마다 요청하지는 않는다.
      const isStale = Date.now() - dataUpdatedAt >= MATCH_POLLING_INTERVAL_MS;

      if (visible && isStale) refetch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refetch, dataUpdatedAt]);

  return {
    ...query,
    isPolling: isVisible && shouldKeepUpdating(query.data),
  };
}
