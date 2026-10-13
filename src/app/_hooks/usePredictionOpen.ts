"use client";

import { useEffect, useState } from "react";
import { isPredictionOpen } from "@/app/_libs/_utils/prediction";
import { Match } from "@/app/_types/matches";

/** setTimeout 은 약 24.8일을 넘기면 즉시 실행되므로 그보다 먼 킥오프는 타이머를 걸지 않는다. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/**
 * 예측 입력 가능 여부. 화면을 열어 둔 채 킥오프가 지나면 저절로 잠긴다.
 * 현재 시각에 의존하므로 하이드레이션 이후에만 의미가 있다.
 */
export function usePredictionOpen(match: Pick<Match, "status" | "utcDate">) {
  const [isOpen, setIsOpen] = useState(() =>
    isPredictionOpen(match, new Date()),
  );
  const [trackedMatch, setTrackedMatch] = useState(match);

  // 폴링으로 상태가 바뀐 경기가 들어오면 렌더 중에 다시 판정한다.
  if (
    trackedMatch.status !== match.status ||
    trackedMatch.utcDate !== match.utcDate
  ) {
    setTrackedMatch(match);
    setIsOpen(isPredictionOpen(match, new Date()));
  }

  useEffect(() => {
    if (!isOpen) return;

    const remaining = new Date(match.utcDate).getTime() - Date.now();
    if (remaining > MAX_TIMEOUT_MS) return;

    const timer = setTimeout(() => setIsOpen(false), Math.max(0, remaining));

    return () => clearTimeout(timer);
  }, [isOpen, match.utcDate]);

  return isOpen;
}
