import PredictionPageSkeleton from "../_components/_widgets/predictions/PredictionPageSkeleton/PredictionPageSkeleton";
import styles from "./predictions.module.scss";

export default function Loading() {
  return (
    <div className={styles.predictions}>
      <header>
        <h2>Predictions</h2>
        <p>경기 일정을 불러오는 중입니다.</p>
      </header>
      <PredictionPageSkeleton />
    </div>
  );
}
