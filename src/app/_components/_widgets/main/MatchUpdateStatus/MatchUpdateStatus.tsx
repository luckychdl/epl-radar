"use client";

import { format } from "date-fns";
import { Info, RefreshCw } from "lucide-react";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import styles from "./MatchUpdateStatus.module.scss";

interface Props {
  updatedAt: number;
  isPolling: boolean;
}

export default function MatchUpdateStatus({ updatedAt, isPolling }: Props) {
  // 갱신 시각은 서버 렌더 시점과 다를 수밖에 없어 하이드레이션 이후에 그린다.
  const hasHydrated = useHasHydrated();

  return (
    <div className={styles.matchUpdateStatus}>
      <span className={isPolling ? styles.active : undefined}>
        <RefreshCw size={12} />
        {isPolling ? "자동 갱신 중" : "자동 갱신"}
        {hasHydrated && ` · ${format(updatedAt, "HH:mm")} 기준`}
      </span>
      {/* 키보드로도 안내를 열 수 있어야 하므로 포커스를 받게 한다. */}
      <span className={styles.notice} tabIndex={0}>
        <Info size={12} />
        <em>무료 API 특성상 스코어가 지연될 수 있습니다</em>
      </span>
    </div>
  );
}
