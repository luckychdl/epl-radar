import { Match } from "@/app/_types/matches";
import styles from "./RecentMatchesForm.module.scss";
import Image from "next/image";
interface Props {
  recent: Match[];
  id: string;
}
export default function RecentMatchesForm({ recent, id }: Props) {
  const match = recent
    .filter(
      (match: Match) =>
        match.homeTeam.id === Number(id) || match.awayTeam.id === Number(id),
    )

    .slice(-5);
  return (
    <div className={styles.recentMatchesForm}>
      <span>Team form</span>
      <div>
        {match.map((v) => {
          const isHome = v.homeTeam.id == Number(id);
          const homeScore = v.score.fullTime.home;

          const awayScore = v.score.fullTime.away;

          if (homeScore == null || awayScore == null) {
            return null;
          }
          const isWin = isHome ? homeScore > awayScore : homeScore < awayScore;
          const isLose = !isHome
            ? homeScore > awayScore
            : homeScore < awayScore;
          const isDraw = homeScore === v.score.fullTime?.away;
          console.log(isHome, isWin, isLose);
          return (
            <div key={v.id}>
              <span
                className={`${isWin ? styles.win : undefined} ${isLose ? styles.lose : undefined} ${isDraw ? styles.draw : undefined}`}
              >
                {homeScore} - {awayScore}
              </span>
              <Image
                src={isHome ? v.awayTeam.crest : v.homeTeam.crest}
                alt=""
                width={32}
                height={32}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
