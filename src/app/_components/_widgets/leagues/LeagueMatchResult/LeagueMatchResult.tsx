import { getMatchOutcome } from "@/app/_libs/_utils/match";
import { Match } from "@/app/_types/matches";
import LeagueMatchTooltip from "../LeagueMatchTooltip/LeagueMatchTooltip";
import styles from "./LeagueMatchResult.module.scss";

const OUTCOME_STYLE = {
  W: styles.winner,
  D: styles.draw,
  L: styles.loser,
} as const;

interface Props {
  match: Match;
  teamId: number;
}

export default function LeagueMatchResult({ match, teamId }: Props) {
  const outcome = getMatchOutcome(match, teamId);

  return (
    <div
      className={`${styles.leagueMatchResultRow} ${outcome ? OUTCOME_STYLE[outcome] : ""}`}
    >
      <LeagueMatchTooltip matchInfo={match}>
        <span className={styles.badge}>{outcome}</span>
      </LeagueMatchTooltip>
    </div>
  );
}
