import { format } from "date-fns";
import { BudgetSnapshot, getCacheHitRate } from "@/app/_libs/_utils/budget";
import styles from "./BudgetPanel.module.scss";

interface Props {
  snapshot: BudgetSnapshot;
  /** 무료 플랜 분당 한도 */
  limit: number;
}

function toPercent(rate: number | null) {
  return rate === null ? "-" : `${Math.round(rate * 100)}%`;
}

export default function BudgetPanel({ snapshot, limit }: Props) {
  const { totals, paths, upstreamLastMinute, requestsAvailable } = snapshot;
  const usedRatio = Math.min(1, upstreamLastMinute / limit);
  const isOverBudget = upstreamLastMinute > limit;

  return (
    <div className={styles.budgetPanel}>
      <section className={styles.headline}>
        <div>
          <dt>최근 1분 외부 호출</dt>
          <dd className={isOverBudget ? styles.over : undefined}>
            {upstreamLastMinute}
            <em>/ {limit}</em>
          </dd>
          <div className={styles.meter}>
            <span
              className={isOverBudget ? styles.overBar : undefined}
              style={{ width: `${usedRatio * 100}%` }}
            />
          </div>
        </div>
        <div>
          <dt>API 가 알려준 잔여</dt>
          <dd>{requestsAvailable ?? "-"}</dd>
        </div>
        <div>
          <dt>캐시 적중률</dt>
          <dd>{toPercent(getCacheHitRate(totals))}</dd>
        </div>
        <div>
          <dt>429</dt>
          <dd className={totals.rateLimited > 0 ? styles.over : undefined}>
            {totals.rateLimited}
          </dd>
        </div>
      </section>

      {paths.length === 0 ? (
        <p className={styles.empty}>
          아직 기록된 호출이 없습니다. 홈이나 리그 페이지를 열고 돌아오세요.
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">경로</th>
              <th scope="col">호출</th>
              <th scope="col">외부</th>
              <th scope="col">캐시</th>
              <th scope="col">429</th>
              <th scope="col">마지막 외부 호출</th>
            </tr>
          </thead>
          <tbody>
            {paths.map((stat) => (
              <tr key={stat.path}>
                <th scope="row">{stat.path}</th>
                <td>{stat.calls}</td>
                <td>{stat.upstream}</td>
                <td>{toPercent(getCacheHitRate(stat))}</td>
                <td className={stat.rateLimited > 0 ? styles.over : undefined}>
                  {stat.rateLimited}
                </td>
                <td suppressHydrationWarning>
                  {stat.lastUpstreamAt
                    ? format(new Date(stat.lastUpstreamAt), "HH:mm:ss")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.notice}>
        <strong>호출</strong> 은 앱 코드가 요청한 횟수, <strong>외부</strong> 는
        그중 실제로 football-data 까지 나간 횟수입니다. 응답 <code>Date</code>{" "}
        헤더가 직전과 같으면 Next 의 fetch 캐시가 재생한 것으로 봅니다. 계측은
        서버 프로세스 메모리에만 쌓이므로 인스턴스가 여러 개면 인스턴스별 수치이고
        재시작하면 초기화됩니다. 기준 시각 {format(new Date(snapshot.since), "HH:mm:ss")}.
      </p>
    </div>
  );
}
