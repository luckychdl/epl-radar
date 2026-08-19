"use client";

import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

/**
 * 하이드레이션 완료 여부.
 * 서버 렌더 결과와 달라질 수 있는 값(로컬 시간, localStorage)을 그리기 전에 확인한다.
 * 서버 스냅샷은 false, 클라이언트 스냅샷은 true 이므로 별도 effect 없이 판별된다.
 */
export function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
