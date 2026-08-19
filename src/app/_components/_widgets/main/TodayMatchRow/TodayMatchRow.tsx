"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import MatchPreview from "@/app/_components/_widgets/matches/MatchPreview/MatchPreview";
import {
  getMatchStatusLabel,
  isLiveMatch,
  isScoreVisible,
} from "@/app/_libs/_utils/match";
import { Match } from "@/app/_types/matches";
import styles from "./TodayMatchRow.module.scss";

interface Props {
  match: Match;
  isScoreChanged?: boolean;
}

export default function TodayMatchRow({ match, isScoreChanged }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const kickOff = new Date(match.utcDate);
  const statusLabel = getMatchStatusLabel(match.status);
  const showScore = isScoreVisible(match.status);
  const isUpdating = isLiveMatch(match.status);

  return (
    <div className={styles.matchRowWrap}>
      <button
        type="button"
        className={styles.matchRows}
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        {isScoreChanged && (
          // 스코어가 바뀐 행만 1회 강조한다. hover 배경을 덮지 않도록 오버레이로 처리한다.
          <motion.span
            className={styles.flash}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        )}
        <div className={styles.matchTeam}>
          <span>{match.homeTeam.shortName}</span>
          <Image src={match.homeTeam.crest} alt="" width={20} height={20} />
        </div>

        {showScore ? (
          <div className={styles.matchScore}>
            <strong className={isUpdating ? styles.updating : undefined}>
              {match.score.fullTime.home ?? 0} -{" "}
              {match.score.fullTime.away ?? 0}
            </strong>
            <p className={isUpdating ? styles.updating : undefined}>
              {statusLabel}
            </p>
          </div>
        ) : (
          <div className={styles.matchTime}>
            {/* 서버/클라이언트 타임존이 다르면 표기가 갈리므로 hydration 경고를 억제한다. */}
            <span suppressHydrationWarning>
              {statusLabel ?? (
                <>
                  {format(kickOff, "h:mm")}
                  <p>{format(kickOff, "a")}</p>
                </>
              )}
            </span>
          </div>
        )}

        <div className={styles.matchTeam}>
          <Image src={match.awayTeam.crest} alt="" width={20} height={20} />
          <span>{match.awayTeam.shortName}</span>
        </div>
      </button>

      {isExpanded && (
        <div className={styles.expanded}>
          <MatchPreview matchId={match.id} />
        </div>
      )}
    </div>
  );
}
