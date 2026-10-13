import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import TeamScorers from "@/app/_components/_widgets/teams/TeamScorers/TeamScorers";
import {
  getHomeAwaySplit,
  getSeasonAverages,
  TeamRecord,
} from "@/app/_libs/_utils/teamStats";
import { Match } from "@/app/_types/matches";
import { ScorersResult } from "@/app/_libs/football/scorers";
import { TableRow } from "@/app/_types/standings";
import styles from "./TeamStats.module.scss";

interface Props {
  row: TableRow | undefined;
  recent: Match[];
  teamId: number;
  scorers: ScorersResult | null;
}

/** 순위표 행과 홈·원정 집계가 승/무/패 필드를 공유하므로 그 부분만 받는다. */
function describeRecord(record: Pick<TeamRecord, "won" | "draw" | "lost">) {
  return `${record.won}승 ${record.draw}무 ${record.lost}패`;
}

export default function TeamStats({ row, recent, teamId, scorers }: Props) {
  if (!row) {
    return (
      <ErrorNotice
        title="시즌 기록이 없습니다."
        description="이 팀이 속한 대회는 순위표를 제공하지 않습니다."
      />
    );
  }

  const averages = getSeasonAverages(row);
  const split = getHomeAwaySplit(recent, teamId);

  // 승/무/패를 한 칸에 몰면 타일 하나만 두 줄이 되어 줄이 어긋난다. 값마다 한 칸씩 쓴다.
  const summary = [
    { label: "순위", value: `${row.position}위` },
    { label: "승점", value: `${row.points}` },
    { label: "경기", value: `${row.playedGames}` },
    { label: "승", value: `${row.won}` },
    { label: "무", value: `${row.draw}` },
    { label: "패", value: `${row.lost}` },
    { label: "득점", value: `${row.goalsFor}` },
    { label: "실점", value: `${row.goalsAgainst}` },
    {
      label: "득실차",
      value:
        row.goalDifference > 0 ? `+${row.goalDifference}` : `${row.goalDifference}`,
    },
  ];

  return (
    <div className={styles.teamStats}>
      <section>
        <h3>시즌 기록</h3>
        <dl className={styles.summary}>
          {summary.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {averages && (
        <section>
          <h3>경기당 평균</h3>
          <dl className={styles.summary}>
            <div>
              <dt>승점</dt>
              <dd>{averages.pointsPerGame.toFixed(2)}</dd>
            </div>
            <div>
              <dt>득점</dt>
              <dd>{averages.goalsForPerGame.toFixed(2)}</dd>
            </div>
            <div>
              <dt>실점</dt>
              <dd>{averages.goalsAgainstPerGame.toFixed(2)}</dd>
            </div>
            <div>
              <dt>승률</dt>
              <dd>{Math.round(averages.winRate * 100)}%</dd>
            </div>
          </dl>
        </section>
      )}

      <section>
        <h3>홈 · 원정</h3>
        <div className={styles.split}>
          {(
            [
              ["홈", split.home],
              ["원정", split.away],
            ] as const
          ).map(([label, record]) => (
            <div key={label}>
              <strong>{label}</strong>
              {record.played === 0 ? (
                <p className={styles.empty}>기록 없음</p>
              ) : (
                <>
                  <p>{describeRecord(record)}</p>
                  <span>
                    {record.played}경기 · {record.goalsFor}득점{" "}
                    {record.goalsAgainst}실점
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      <TeamScorers
        data={scorers?.data ?? null}
        teamId={teamId}
        isCurrentSeason={scorers?.isCurrentSeason ?? true}
      />

      <p className={styles.notice}>
        무료 플랜은 라인업·카드·개인 패스 기록을 주지 않습니다. 순위표, 경기
        결과, 대회 득점 순위로 계산 가능한 지표만 표시합니다.
      </p>
    </div>
  );
}
