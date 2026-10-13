"use client";

import { ReactNode, useMemo } from "react";
import { Sparkles, User } from "lucide-react";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import { summarizePredictions } from "@/app/_libs/_utils/prediction";
import { usePredictionStore } from "@/app/_stores/usePredictionStore";
import { PredictionRecord } from "@/app/_types/predictions";
import styles from "./PredictionSummaryCard.module.scss";

interface RecordColumnProps {
  label: string;
  icon: ReactNode;
  record: PredictionRecord;
  variant: "user" | "ai";
}

function RecordColumn({ label, icon, record, variant }: RecordColumnProps) {
  return (
    <div className={`${styles.column} ${styles[variant]}`}>
      <span className={styles.label}>
        {icon}
        {label}
      </span>
      <strong>
        {record.points}
        <small>점</small>
      </strong>
      <dl>
        <div>
          <dt>승부 적중률</dt>
          <dd>{record.hitRate === null ? "-" : `${record.hitRate}%`}</dd>
        </div>
        <div>
          <dt>스코어 적중</dt>
          <dd>{record.exact}</dd>
        </div>
        <div>
          <dt>채점</dt>
          <dd>{record.total}경기</dd>
        </div>
      </dl>
    </div>
  );
}

export default function PredictionSummaryCard() {
  const hasHydrated = useHasHydrated();
  const entries = usePredictionStore((state) => state.entries);
  const summary = useMemo(
    () => summarizePredictions(Object.values(entries)),
    [entries],
  );

  if (!hasHydrated) {
    return <div className={styles.skeleton} />;
  }

  const { win, draw, lose } = summary.headToHead;
  const hasHeadToHead = win + draw + lose > 0;

  return (
    <section className={styles.predictionSummaryCard} aria-label="예측 성적">
      <div className={styles.columns}>
        <RecordColumn
          label="나"
          icon={<User size={14} />}
          record={summary.user}
          variant="user"
        />
        <span className={styles.versus}>vs</span>
        <RecordColumn
          label="AI"
          icon={<Sparkles size={14} />}
          record={summary.ai}
          variant="ai"
        />
      </div>
      <p className={styles.headToHead}>
        {hasHeadToHead
          ? `같은 경기 맞대결 ${win}승 ${draw}무 ${lose}패`
          : "나와 AI 가 모두 예측한 경기가 끝나면 맞대결 전적이 쌓입니다."}
      </p>
    </section>
  );
}
