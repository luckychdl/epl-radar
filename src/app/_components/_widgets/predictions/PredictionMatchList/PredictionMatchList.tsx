"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import TodayMatchRow from "@/app/_components/_widgets/main/TodayMatchRow/TodayMatchRow";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import { groupOpenMatchesByDay } from "@/app/_libs/_utils/prediction";
import { Match } from "@/app/_types/matches";
import styles from "./PredictionMatchList.module.scss";

const MAX_DAYS = 3;
const SKELETON_ROWS = 4;

interface Props {
  matches: Match[];
}

function PredictionMatchListContent({ matches }: Props) {
  // 목록을 여는 순간 기준으로 한 번만 묶는다. 킥오프가 지난 행은 행 안에서 스스로 잠긴다.
  const [groups] = useState(() =>
    groupOpenMatchesByDay(matches, new Date(), MAX_DAYS),
  );

  if (groups.length === 0) {
    return (
      <div className={styles.empty}>
        앞으로 열흘 안에 예측할 수 있는 경기가 없습니다.
      </div>
    );
  }

  return (
    <div className={styles.predictionMatchList}>
      {groups.map((group) => (
        <section key={group.day} className={styles.dayCard}>
          {/* yyyy-MM-dd 를 new Date 로 읽으면 UTC 자정이 돼 서쪽 타임존에서 하루 밀린다. */}
          <h4>{format(parseISO(group.day), "M월 d일 (EEE)", { locale: ko })}</h4>
          {group.matches.map((match) => (
            <TodayMatchRow key={match.id} match={match} />
          ))}
        </section>
      ))}
    </div>
  );
}

export default function PredictionMatchList({ matches }: Props) {
  // 날짜 묶음은 사용자의 로컬 타임존 기준이라 서버 렌더와 달라질 수 있다.
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return (
      <div className={styles.predictionMatchList}>
        <section className={styles.dayCard}>
          <span className={styles.skeletonHeader} />
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <span key={index} className={styles.skeletonRow} />
          ))}
        </section>
      </div>
    );
  }

  return <PredictionMatchListContent matches={matches} />;
}
