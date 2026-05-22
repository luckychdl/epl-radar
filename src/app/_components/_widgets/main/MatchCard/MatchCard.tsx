import LiveScoreHeader from "../LiveScoreHeader/LiveScoreHeader";
import styles from "./MatchCard.module.scss";

export default function MatchCard() {
  return (
    <div className={styles.matchCard}>
      <LiveScoreHeader />
    </div>
  );
}
