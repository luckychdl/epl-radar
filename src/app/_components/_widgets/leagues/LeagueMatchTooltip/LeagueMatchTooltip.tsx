import { ReactNode } from "react";
import { format } from "date-fns";
import { Match } from "@/app/_types/matches";
import styles from "./LeagueMatchTooltip.module.scss";

interface Props {
  children: ReactNode;
  matchInfo: Match;
}

export default function LeagueMatchTooltip({ children, matchInfo }: Props) {
  const { homeTeam, awayTeam, score, utcDate } = matchInfo;

  return (
    <div className={styles.tooltipWrap}>
      {children}
      <div className={styles.tooltip}>
        {`${format(new Date(utcDate), "MMM d")}: ${homeTeam.name} ${score.fullTime.home ?? "-"} - ${score.fullTime.away ?? "-"} ${awayTeam.name}`}
      </div>
    </div>
  );
}
