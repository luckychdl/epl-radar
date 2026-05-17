import styles from "./LeagueTableHeader.module.scss";
export default function LeagueTableHeader() {
  return (
    <header className={styles.leagueTableHeader}>
      <p>#</p>
      <p></p>
      <p>PL</p>
      <p>W</p>
      <p>D</p>
      <p>L</p>
      <p>+/-</p>
      <p>GD</p>
      <p>PTS</p>
      <p className={styles.start}>Form</p>
      <p className={styles.start}>Next</p>
    </header>
  );
}
