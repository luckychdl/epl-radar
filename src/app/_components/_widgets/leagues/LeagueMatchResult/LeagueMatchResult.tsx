"use client";
import { Team } from "@/app/_types/standings";
import { Match } from "@/app/_types/teams";
import styles from "./LeagueMatchResult.module.scss";
import LeagueMatchTooltip from "../LeagueMatchTooltip/LeagueMatchTooltip";
interface Props {
  match: Match;
  team: Team;
}
export default function LeagueMatchResult({ match, team }: Props) {
  const isHome = team.id == match.homeTeam.id;
  const isAway = team.id == match.awayTeam.id;
  const winner =
    (isHome && match.score.winner == "HOME_TEAM") ||
    (isAway && match.score.winner == "AWAY_TEAM")
      ? "W"
      : (isHome && match.score.winner == "AWAY_TEAM") ||
          (isAway && match.score.winner == "HOME_TEAM")
        ? "L"
        : match.score.winner == "DRAW"
          ? "D"
          : null;

  return (
    <>
      <button
        className={`${styles.leagueMatchResultRow} ${winner == "W" ? styles.winner : undefined} ${winner == "D" ? styles.draw : undefined} ${winner == "L" ? styles.loser : undefined}`}
      >
        <LeagueMatchTooltip matchInfo={match}>
          <span className={styles.badge}>{winner}</span>
        </LeagueMatchTooltip>
      </button>
    </>
  );
}
