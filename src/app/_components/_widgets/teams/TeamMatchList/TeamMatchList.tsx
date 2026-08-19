import Image from "next/image";
import { format } from "date-fns";
import {
  getMatchOutcome,
  isFinishedMatch,
  isTeamMatch,
} from "@/app/_libs/_utils/match";
import { Match } from "@/app/_types/matches";
import styles from "./TeamMatchList.module.scss";

const OUTCOME_STYLE = {
  W: styles.win,
  D: styles.draw,
  L: styles.lose,
} as const;

interface Props {
  recent: Match[];
  scheduled: Match[];
  teamId: number;
}

function byKickOff(matches: Match[], teamId: number, descending: boolean) {
  return matches
    .filter((match) => isTeamMatch(match, teamId))
    .sort((a, b) => {
      const diff =
        new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();

      return descending ? -diff : diff;
    });
}

function MatchRow({ match, teamId }: { match: Match; teamId: number }) {
  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const kickOff = new Date(match.utcDate);
  const outcome = getMatchOutcome(match, teamId);
  const { home, away } = match.score.fullTime;
  const played = isFinishedMatch(match.status) && home !== null && away !== null;

  return (
    <li>
      <span className={styles.date} suppressHydrationWarning>
        {format(kickOff, "MMM d")}
      </span>
      <span className={styles.venue}>{isHome ? "홈" : "원정"}</span>
      <div className={styles.opponent}>
        {opponent.crest && (
          <Image src={opponent.crest} alt="" width={20} height={20} />
        )}
        <span>{opponent.shortName || opponent.name}</span>
      </div>
      {played ? (
        <span
          className={`${styles.score} ${outcome ? OUTCOME_STYLE[outcome] : ""}`}
        >
          {isHome ? home : away} - {isHome ? away : home}
        </span>
      ) : (
        <span className={styles.kickOff} suppressHydrationWarning>
          {format(kickOff, "h:mm aa")}
        </span>
      )}
    </li>
  );
}

export default function TeamMatchList({ recent, scheduled, teamId }: Props) {
  const results = byKickOff(recent, teamId, true);
  const fixtures = byKickOff(scheduled, teamId, false);

  return (
    <div className={styles.teamMatchList}>
      {(
        [
          ["최근 결과", results],
          ["예정 경기", fixtures],
        ] as const
      ).map(([title, matches]) => (
        <section key={title}>
          <h3>
            {title}
            <em>{matches.length}경기</em>
          </h3>
          {matches.length === 0 ? (
            <p className={styles.empty}>표시할 경기가 없습니다.</p>
          ) : (
            <ul>
              {matches.map((match) => (
                <MatchRow key={match.id} match={match} teamId={teamId} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
