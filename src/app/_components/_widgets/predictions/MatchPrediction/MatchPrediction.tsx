"use client";

import { useEffect } from "react";
import PredictionAiPick from "@/app/_components/_widgets/predictions/PredictionAiPick/PredictionAiPick";
import PredictionUserPick from "@/app/_components/_widgets/predictions/PredictionUserPick/PredictionUserPick";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import { usePredictionOpen } from "@/app/_hooks/usePredictionOpen";
import { usePredictionStore } from "@/app/_stores/usePredictionStore";
import { Match } from "@/app/_types/matches";
import styles from "./MatchPrediction.module.scss";

interface Props {
  match: Match;
}

function MatchPredictionContent({ match }: Props) {
  const entry = usePredictionStore((state) => state.entries[match.id]);
  const settle = usePredictionStore((state) => state.settle);
  const isOpen = usePredictionOpen(match);

  // 폴링으로 받은 경기가 끝나 있으면 그 자리에서 채점한다.
  useEffect(() => {
    settle([match]);
  }, [match, settle]);

  return (
    <section className={styles.matchPrediction} aria-label="승부예측">
      <PredictionUserPick
        // 저장 여부가 바뀌면 편집 상태를 처음부터 다시 잡는다.
        key={entry?.user ? "saved" : "empty"}
        match={match}
        entry={entry}
        isOpen={isOpen}
      />
      <PredictionAiPick match={match} entry={entry} isOpen={isOpen} />
    </section>
  );
}

export default function MatchPrediction({ match }: Props) {
  // 예측은 localStorage 와 현재 시각에 의존하므로 하이드레이션 전에는 골격만 그린다.
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return (
      <section className={styles.matchPrediction} aria-hidden>
        <span className={styles.skeleton} />
        <span className={styles.skeleton} />
      </section>
    );
  }

  return <MatchPredictionContent match={match} />;
}
