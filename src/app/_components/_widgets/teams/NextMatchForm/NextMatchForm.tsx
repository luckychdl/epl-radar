import Image from "next/image";
import { format } from "date-fns";
import MatchPreview from "@/app/_components/_widgets/matches/MatchPreview/MatchPreview";
import { getNextMatchOfTeam } from "@/app/_libs/_utils/match";
import { Match } from "@/app/_types/matches";
import styles from "./NextMatchForm.module.scss";

interface Props {
  scheduled: Match[];
  teamId: number;
}

export default function NextMatchForm({ scheduled, teamId }: Props) {
  const nextMatch = getNextMatchOfTeam(scheduled, teamId);

  if (!nextMatch) {
    return (
      <div className={styles.nextMatchForm}>
        <div className={styles.header}>
          <span>Next Match</span>
        </div>
        <div className={styles.empty}>예정된 경기가 없습니다.</div>
      </div>
    );
  }

  const isHome = nextMatch.homeTeam.id === teamId;
  const team = isHome ? nextMatch.homeTeam : nextMatch.awayTeam;
  const opponent = isHome ? nextMatch.awayTeam : nextMatch.homeTeam;
  const kickOff = new Date(nextMatch.utcDate);

  return (
    <div className={styles.nextMatchForm}>
      <div className={styles.header}>
        <span>Next Match</span>
        <div className={styles.competition}>
          <p>{nextMatch.competition.name}</p>
          {nextMatch.competition.emblem && (
            <Image
              src={nextMatch.competition.emblem}
              alt=""
              width={24}
              height={24}
            />
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div>
          {team.crest && (
            <Image src={team.crest} alt="" width={32} height={32} />
          )}
          <p>{team.shortName}</p>
        </div>
        <div>
          <span>{format(kickOff, "h:mm aa")}</span>
          <p>{format(kickOff, "MMM d")}</p>
        </div>
        <div>
          {opponent.crest && (
            <Image src={opponent.crest} alt="" width={32} height={32} />
          )}
          <p>{opponent.shortName}</p>
        </div>
      </div>
      <MatchPreview matchId={nextMatch.id} />
    </div>
  );
}
