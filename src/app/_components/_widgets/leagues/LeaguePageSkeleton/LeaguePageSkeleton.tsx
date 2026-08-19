import DetailHeaderSkeleton from "@/app/_components/_commons/DetailHeaderSkeleton/DetailHeaderSkeleton";
import { ARCHIVE_SEASON_LIMIT } from "@/app/_libs/_utils/scorers";
import styles from "./LeaguePageSkeleton.module.scss";

const TABLE_ROWS = 20;
const SCORER_ROWS = 10;

/** 리그 페이지 구성: 헤더 → 시즌 칩 → 순위표 → 순위 변동 → 득점 순위 */
export default function LeaguePageSkeleton() {
  return (
    <div className={styles.leaguePageSkeleton}>
      <DetailHeaderSkeleton tabs={2} />

      <div className={styles.seasons}>
        {Array.from({ length: ARCHIVE_SEASON_LIMIT }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      <section className={styles.table}>
        {Array.from({ length: TABLE_ROWS }).map((_, index) => (
          <div key={index}>
            <span className={styles.rank} />
            <span className={styles.crest} />
            <span className={styles.teamName} />
            <span className={styles.stats} />
          </div>
        ))}
      </section>

      <section className={styles.chart}>
        <span className={styles.blockTitle} />
        <div className={styles.chartArea} />
      </section>

      <section className={styles.scorers}>
        <span className={styles.blockTitle} />
        {Array.from({ length: SCORER_ROWS }).map((_, index) => (
          <div key={index}>
            <span className={styles.rank} />
            <span className={styles.playerName} />
            <span className={styles.goals} />
          </div>
        ))}
      </section>
    </div>
  );
}
