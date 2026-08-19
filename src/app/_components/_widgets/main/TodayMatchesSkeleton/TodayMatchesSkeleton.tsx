import styles from "./TodayMatchesSkeleton.module.scss";

interface Props {
  /** 미리 그려둘 리그 묶음 수 */
  groups?: number;
}

/** TodayMatches 의 리그 헤더 + 경기 행 골격 */
export default function TodayMatchesSkeleton({ groups = 3 }: Props) {
  return (
    <div className={styles.todayMatchesSkeleton}>
      {Array.from({ length: groups }).map((_, group) => (
        <section key={group}>
          <header>
            <span className={styles.emblem} />
            <span className={styles.leagueName} />
          </header>
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={row} className={styles.row}>
              <span className={styles.team} />
              <span className={styles.time} />
              <span className={styles.team} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
