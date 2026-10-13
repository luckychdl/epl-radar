import ErrorNotice from "../_components/_commons/ErrorNotice/ErrorNotice";
import PredictionHistory from "../_components/_widgets/predictions/PredictionHistory/PredictionHistory";
import PredictionMatchList from "../_components/_widgets/predictions/PredictionMatchList/PredictionMatchList";
import PredictionSummaryCard from "../_components/_widgets/predictions/PredictionSummaryCard/PredictionSummaryCard";
import {
  getRecentWindowMatchesServer,
  getUpcomingWindowMatchesServer,
} from "../_libs/football/matches";
import styles from "./predictions.module.scss";

export const metadata = { title: "Predictions | EPL Radar" };

export default async function PredictionsPage() {
  // My Teams 와 같은 두 URL 이라 캐시를 공유한다. 예측 화면 때문에 외부 요청이 늘지 않는다.
  const [recent, upcoming] = await Promise.all([
    getRecentWindowMatchesServer().catch(() => null),
    getUpcomingWindowMatchesServer().catch(() => null),
  ]);

  return (
    <div className={styles.predictions}>
      <header>
        <h2>Predictions</h2>
        <p>
          킥오프 전까지 스코어를 예측하고 AI 와 겨뤄보세요. 스코어 적중 3점,
          승부 적중 1점. 기록은 이 브라우저에만 저장됩니다.
        </p>
      </header>

      <PredictionSummaryCard />

      <section className={styles.section}>
        <h3>예측 가능한 경기</h3>
        {upcoming ? (
          <PredictionMatchList matches={upcoming.matches} />
        ) : (
          <ErrorNotice description="예정 경기를 가져오지 못했습니다. 저장한 예측 기록은 아래에서 볼 수 있습니다." />
        )}
      </section>

      <section className={styles.section}>
        <h3>내 예측 기록</h3>
        <PredictionHistory recentMatches={recent?.matches ?? []} />
      </section>
    </div>
  );
}
