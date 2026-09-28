"use client";

import { ReactNode, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import PredictionGradeBadge from "@/app/_components/_widgets/predictions/PredictionGradeBadge/PredictionGradeBadge";
import { useHasHydrated } from "@/app/_hooks/useHasHydrated";
import {
  gradePrediction,
  sortEntriesByKickOffDesc,
} from "@/app/_libs/_utils/prediction";
import { usePredictionStore } from "@/app/_stores/usePredictionStore";
import { Match } from "@/app/_types/matches";
import { PredictedScore, PredictionEntry } from "@/app/_types/predictions";
import styles from "./PredictionHistory.module.scss";

const SKELETON_COUNT = 3;

interface Props {
  /** 서버가 이미 받아 둔 최근 10일 결과. 이걸로 채점하고 따로 요청하지 않는다. */
  recentMatches: Match[];
}

interface PickProps {
  label: ReactNode;
  pick?: PredictedScore;
  result?: PredictedScore;
}

function Pick({ label, pick, result }: PickProps) {
  return (
    <div className={styles.pick}>
      <span className={styles.pickLabel}>{label}</span>
      {pick ? (
        <>
          <strong>
            {pick.home} : {pick.away}
          </strong>
          {result && <PredictionGradeBadge grade={gradePrediction(pick, result)} />}
        </>
      ) : (
        <span className={styles.none}>-</span>
      )}
    </div>
  );
}

function HistoryRow({ entry }: { entry: PredictionEntry }) {
  const { match, result } = entry;

  return (
    <li className={styles.row}>
      <div className={styles.fixture}>
        <em>{format(new Date(match.utcDate), "M/d HH:mm")}</em>
        <div className={styles.teams}>
          <span>
            {match.homeTeam.crest && (
              <Image src={match.homeTeam.crest} alt="" width={18} height={18} />
            )}
            {match.homeTeam.shortName}
          </span>
          <strong className={result ? undefined : styles.pending}>
            {result ? `${result.home} - ${result.away}` : "vs"}
          </strong>
          <span>
            {match.awayTeam.crest && (
              <Image src={match.awayTeam.crest} alt="" width={18} height={18} />
            )}
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>
      <div className={styles.picks}>
        <Pick label="나" pick={entry.user} result={result} />
        <Pick
          label={
            <>
              <Sparkles size={11} />
              AI
            </>
          }
          pick={entry.ai?.score}
          result={result}
        />
      </div>
    </li>
  );
}

function PredictionHistoryContent({ recentMatches }: Props) {
  const entries = usePredictionStore((state) => state.entries);
  const settle = usePredictionStore((state) => state.settle);
  const sorted = useMemo(
    () => sortEntriesByKickOffDesc(Object.values(entries)),
    [entries],
  );

  useEffect(() => {
    settle(recentMatches);
  }, [recentMatches, settle]);

  if (sorted.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>아직 예측한 경기가 없습니다.</strong>
        <p>
          위 목록이나 <Link href="/">홈</Link>의 경기를 펼쳐 스코어를
          예측해보세요.
        </p>
      </div>
    );
  }

  return (
    <ul className={styles.predictionHistory}>
      {sorted.map((entry) => (
        <HistoryRow key={entry.match.id} entry={entry} />
      ))}
    </ul>
  );
}

export default function PredictionHistory({ recentMatches }: Props) {
  // 기록은 localStorage 에만 있으므로 하이드레이션 전에는 골격만 그린다.
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return (
      <ul className={styles.predictionHistory}>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <li key={index} className={styles.skeleton} />
        ))}
      </ul>
    );
  }

  return <PredictionHistoryContent recentMatches={recentMatches} />;
}
