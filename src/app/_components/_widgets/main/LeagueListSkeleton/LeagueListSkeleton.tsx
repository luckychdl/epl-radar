import styles from "./LeagueListSkeleton.module.scss";
import { SUPPORTED_LEAGUES } from "@/app/_constants/leagues";

/** ListCard 와 같은 골격. 리그 수도 실제로 그려질 개수와 맞춘다. */
export default function LeagueListSkeleton() {
  return (
    <div className={styles.leagueListSkeleton}>
      <span className={styles.title} />
      {SUPPORTED_LEAGUES.map((league) => (
        <div key={league.code} className={styles.row}>
          <span className={styles.emblem} />
          <span className={styles.name} />
        </div>
      ))}
    </div>
  );
}
