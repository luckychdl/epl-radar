import {
  getMatchesRecentServer,
  getMatchesScheduledServer,
} from "@/app/_libs/football/matches";
import { Standing } from "@/app/_types/standings";
import LeagueTableHeader from "../LeagueTableHeader/LeagueTableHeader";
import LeagueTableRow from "../LeagueTableRow/LeagueTableRow";
import styles from "./LeagueTable.module.scss";

interface Props {
  code: string;
  standings: Standing;
  /**
   * 보고 있는 시즌. 페이지와 같은 값을 넘겨야 한다.
   * 다르면 과거 시즌 순위표 옆에 이번 시즌 폼이 붙고, 요청도 두 벌로 갈라진다.
   */
  season?: number;
}

export default async function LeagueTable({ code, standings, season }: Props) {
  // 최근 폼/다음 경기는 부가 정보이므로 실패해도 순위표 자체는 보여준다.
  const [recent, scheduled] = await Promise.all([
    getMatchesRecentServer(code, season).catch(() => null),
    getMatchesScheduledServer(code, season).catch(() => null),
  ]);

  return (
    <div className={styles.leagueTable}>
      <div>
        <LeagueTableHeader />
        <div>
          {standings.table.map((row) => (
            <LeagueTableRow
              key={row.team.id}
              data={row}
              code={code}
              matches={recent?.matches ?? []}
              scheduled={scheduled?.matches ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
