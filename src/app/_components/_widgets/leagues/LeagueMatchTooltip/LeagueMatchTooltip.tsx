import { ReactNode } from "react";
import styles from "./LeagueMatchTooltip.module.scss";
import { Match } from "@/app/_types/teams";
import { format } from "date-fns";

interface Props {
  children: ReactNode;
  matchInfo: Match;
}
export default function LeagueMatchTooltip({ children, matchInfo }: Props) {
  return (
    <div className={styles.tooltipWrap}>
      {/* <span className={styles.badge}>UCL</span> */}
      {children}
      <div className={styles.tooltip}>
        {format(matchInfo.utcDate, "MMM d") + ":"} {matchInfo.homeTeam.name}{" "}
        {matchInfo.score.fullTime.home} {" - "} {matchInfo.score.fullTime.away}{" "}
        {matchInfo.awayTeam.name}
      </div>
    </div>
  );
}
