import { Standing, Table } from "@/app/_types/standings";
import styles from "./LeagueTable.module.scss";
import LeagueTableHeader from "../LeagueTableHeader/LeagueTableHeader";
import LeagueTableRow from "../LeagueTableRow/LeagueTableRow";

import {
  getMatchesRecentServer,
  getMatchesScheduledServer,
} from "@/app/_libs/football/matches";
interface Props {
  code: string;

  standings: Standing;
}
export default async function LeagueTable({ code, standings }: Props) {
  const recent = await getMatchesRecentServer(code);
  const scheduled = await getMatchesScheduledServer(code);
  return (
    <div className={styles.leagueTable}>
      <div>
        <LeagueTableHeader />
        <div>
          {standings.table.map((v: Table) => (
            <LeagueTableRow
              data={v}
              key={v.team.id}
              matches={recent.matches}
              scheduled={scheduled.matches}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
