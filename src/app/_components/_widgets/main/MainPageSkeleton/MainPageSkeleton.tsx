import LeagueListSkeleton from "../LeagueListSkeleton/LeagueListSkeleton";
import TodayMatchesSkeleton from "../TodayMatchesSkeleton/TodayMatchesSkeleton";
import styles from "./MainPageSkeleton.module.scss";

/** 홈과 같은 3열 그리드. 섹션 스켈레톤은 Suspense fallback 과 같은 것을 쓴다. */
export default function MainPageSkeleton() {
  return (
    <div className={styles.main}>
      <div>
        <LeagueListSkeleton />
      </div>
      <div className={styles.todayMatches}>
        <div className={styles.matchCard}>
          <span className={styles.dateNav} />
        </div>
        <TodayMatchesSkeleton />
      </div>
      <div />
    </div>
  );
}
