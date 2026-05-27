import styles from "./LeaguePageSkeleton.module.scss";
export default function LeaguePageSkeleton() {
  return (
    <div className={styles.leaguePageSkeleton}>
      <section className={styles.leagueHeader}>
        <header>
          <div className={styles.image}></div>
          <div className={styles.text}>
            <span></span>
            <p></p>
          </div>
        </header>
      </section>
      <section className={styles.leagueTable}>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={`league_${index}`}>
            <div className={styles.left}>
              <p></p>
              <span></span>
            </div>
            <div className={styles.right}></div>
          </div>
        ))}
      </section>
    </div>
  );
}
