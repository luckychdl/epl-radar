import styles from "./MainPageSkeleton.module.scss";
export default function MainPageSkeleton() {
  return (
    <div className={styles.main}>
      <div>
        <section className={styles.listCard}>
          <div className={styles.title} />

          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.listItem} />
          ))}
        </section>
      </div>

      <div className={styles.todayMatches}>
        <section className={styles.matchCard}>
          <div className={styles.title} />

          <div className={styles.matchBox} />
        </section>

        <section className={styles.matches}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.matchRow} />
          ))}
        </section>
      </div>

      <div />
    </div>
  );
}
