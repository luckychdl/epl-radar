import { getGradePoints } from "@/app/_libs/_utils/prediction";
import { PredictionGrade } from "@/app/_types/predictions";
import styles from "./PredictionGradeBadge.module.scss";

const LABELS: Record<PredictionGrade, string> = {
  exact: "스코어 적중",
  outcome: "승부 적중",
  miss: "빗나감",
};

interface Props {
  grade: PredictionGrade;
}

export default function PredictionGradeBadge({ grade }: Props) {
  return (
    <span className={`${styles.predictionGradeBadge} ${styles[grade]}`}>
      {LABELS[grade]} · {getGradePoints(grade)}점
    </span>
  );
}
