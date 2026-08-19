import DetailHeaderSkeleton from "@/app/_components/_commons/DetailHeaderSkeleton/DetailHeaderSkeleton";
import { TEAM_TABS } from "@/app/_constants/teams";
import styles from "./TeamPageSkeleton.module.scss";

/**
 * loading.tsx 는 params 를 받지 못해 어느 탭인지 알 수 없다.
 * 그래서 모든 탭이 공유하는 헤더는 정확히 맞추고, 본문은 기본 탭인
 * Overview 의 골격(폼 · 다음 경기 → 잔여 난이도 → 클럽 정보)으로 둔다.
 */
export default function TeamPageSkeleton() {
  return (
    <div className={styles.teamPageSkeleton}>
      <DetailHeaderSkeleton tabs={TEAM_TABS.length} />

      <div className={styles.matchSection}>
        {[0, 1].map((index) => (
          <section key={index} className={styles.card}>
            <span className={styles.blockTitle} />
            <div className={styles.row}>
              {[0, 1, 2].map((item) => (
                <div key={item} className={styles.cell}>
                  <span className={styles.label} />
                  <span className={styles.crest} />
                  <span className={styles.label} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className={styles.card}>
        <span className={styles.blockTitle} />
        <span className={styles.meter} />
        <span className={styles.caption} />
      </section>

      <section className={styles.card}>
        <span className={styles.blockTitle} />
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.infoRow}>
            <span className={styles.infoLabel} />
            <span className={styles.infoValue} />
          </div>
        ))}
      </section>
    </div>
  );
}
