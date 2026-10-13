import styles from "./PredictionPageSkeleton.module.scss";

const ROW_COUNT = 4;
const HISTORY_COUNT = 3;

/** /predictions 의 실제 골격(요약 카드 → 날짜 카드 → 기록 행)과 같은 높이로 그린다. */
export default function PredictionPageSkeleton() {
  return (
    <>
      <span className={styles.summary} />
      <section className={styles.section}>
        <h3>예측 가능한 경기</h3>
        <div className={styles.dayCard}>
          <span className={styles.dayHeader} />
          {Array.from({ length: ROW_COUNT }).map((_, index) => (
            <span key={index} className={styles.row} />
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h3>내 예측 기록</h3>
        {Array.from({ length: HISTORY_COUNT }).map((_, index) => (
          <span key={index} className={styles.history} />
        ))}
      </section>
    </>
  );
}
