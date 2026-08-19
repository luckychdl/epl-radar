import Image from "next/image";
import { format } from "date-fns";
import {
  getMatchOutcome,
  getRecentMatchesOfTeam,
} from "@/app/_libs/_utils/match";
import { describeStreak, getFormStreak } from "@/app/_libs/_utils/standings";
import { getRecordPoints, getTeamRecord } from "@/app/_libs/_utils/teamStats";
import { Match } from "@/app/_types/matches";
import styles from "./RecentMatchesForm.module.scss";

const OUTCOME_STYLE = {
  W: styles.win,
  D: styles.draw,
  L: styles.lose,
} as const;

interface Props {
  recent: Match[];
  teamId: number;
}

export default function RecentMatchesForm({ recent, teamId }: Props) {
  const matches = getRecentMatchesOfTeam(recent, teamId);
  const outcomes = matches
    .map((match) => getMatchOutcome(match, teamId))
    .filter((outcome): outcome is NonNullable<typeof outcome> => !!outcome);
  const streak = describeStreak(getFormStreak(outcomes));
  const record = getTeamRecord(matches, teamId);

  return (
    <div className={styles.recentMatchesForm}>
      <div className={styles.header}>
        <span>
          Team form
          {streak && <em className={styles.streak}>{streak}</em>}
        </span>
        {record.played > 0 && (
          <p className={styles.summary}>
            최근 {record.played}경기 {getRecordPoints(record)}점 ·{" "}
            {record.goalsFor}득점 {record.goalsAgainst}실점
          </p>
        )}
      </div>

      {matches.length === 0 ? (
        <div className={styles.empty}>최근 경기 기록이 없습니다.</div>
      ) : (
        <div className={styles.matches}>
          {matches.map((match) => {
            const { home, away } = match.score.fullTime;
            if (home === null || away === null) return null;

            const isHome = match.homeTeam.id === teamId;
            const opponent = isHome ? match.awayTeam : match.homeTeam;
            const outcome = getMatchOutcome(match, teamId);

            return (
              <div key={match.id} className={styles.match}>
                <span className={styles.date} suppressHydrationWarning>
                  {format(new Date(match.utcDate), "M/d")} · {isHome ? "홈" : "원정"}
                </span>
                {/* 팀 기준으로 뒤집어 둔다. 옆의 엠블럼이 상대 팀이라 순서가 어긋나면 헷갈린다. */}
                <span className={outcome ? OUTCOME_STYLE[outcome] : undefined}>
                  {isHome ? home : away} - {isHome ? away : home}
                </span>
                <Image src={opponent.crest} alt="" width={32} height={32} />
                <span className={styles.opponentName}>
                  {opponent.shortName || opponent.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
