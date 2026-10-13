import { getRemainingDifficulty } from "@/app/_libs/_utils/standings";
import { Match } from "@/app/_types/matches";
import { TableRow } from "@/app/_types/standings";
import styles from "./RemainingDifficulty.module.scss";

/** 점수 구간별 문구. 색만으로 구분하지 않도록 라벨을 함께 쓴다. */
const LEVELS = [
  { min: 0.66, label: "어려움", tone: "hard" },
  { min: 0.4, label: "보통", tone: "normal" },
  { min: 0, label: "쉬움", tone: "easy" },
] as const;

interface Props {
  scheduled: Match[];
  teamId: number;
  table: TableRow[];
}

export default function RemainingDifficulty({
  scheduled,
  teamId,
  table,
}: Props) {
  const positionByTeam = new Map(
    table.map((row) => [row.team.id, row.position]),
  );
  const difficulty = getRemainingDifficulty(
    scheduled,
    teamId,
    positionByTeam,
    table.length,
  );

  if (!difficulty) return null;

  const level = LEVELS.find((item) => difficulty.score >= item.min) ?? LEVELS[2];
  const percent = Math.round(difficulty.score * 100);

  return (
    <div className={styles.remainingDifficulty}>
      <header>
        <span>잔여 일정 난이도</span>
        <strong className={styles[`${level.tone}Text`]}>{level.label}</strong>
      </header>
      <div className={styles.meter}>
        <span
          className={styles[`${level.tone}Bar`]}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p>
        예정 {difficulty.opponentCount}경기 · 상대 평균 순위{" "}
        {difficulty.averageOpponentPosition.toFixed(1)}위
      </p>
    </div>
  );
}
