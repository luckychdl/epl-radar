import { getScorersOfTeam, sumScorers } from "@/app/_libs/_utils/scorers";
import { CompetitionScorersResponse } from "@/app/_types/scorers";
import styles from "./TeamScorers.module.scss";

interface Props {
  data: CompetitionScorersResponse | null;
  teamId: number;
  isCurrentSeason: boolean;
}

export default function TeamScorers({ data, teamId, isCurrentSeason }: Props) {
  const scorers = getScorersOfTeam(data?.scorers ?? [], teamId);

  if (scorers.length === 0) return null;

  const totals = sumScorers(scorers);
  const seasonYear = new Date(data!.season.startDate).getFullYear();

  return (
    <section className={styles.teamScorers}>
      <h3>
        득점 기여
        {!isCurrentSeason && (
          <em>
            {seasonYear}-{String((seasonYear + 1) % 100).padStart(2, "0")} 시즌
          </em>
        )}
      </h3>

      <ul>
        {scorers.map((scorer) => (
          <li key={scorer.player.id}>
            <div className={styles.player}>
              <span>{scorer.player.name}</span>
              <em>{scorer.playedMatches}경기</em>
            </div>
            <span className={styles.goals}>{scorer.goals}골</span>
            <span className={styles.assists}>
              {scorer.assists === null ? "-" : `${scorer.assists}도움`}
            </span>
          </li>
        ))}
      </ul>

      <p className={styles.notice}>
        대회 득점 순위에 오른 이 팀 선수 {totals.players}명 · 합계 {totals.goals}골{" "}
        {totals.assists}도움. 순위 밖 선수의 기록은 무료 플랜에 없습니다.
      </p>
    </section>
  );
}
