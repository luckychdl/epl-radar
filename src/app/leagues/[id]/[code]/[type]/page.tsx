import LeagueHeader from "@/app/_components/_widgets/leagues/LeagueHeader/LeagueHeader";
import LeagueTable from "@/app/_components/_widgets/leagues/LeagueTable/LeegueTable";
import styles from "./leagues.module.scss";
import { getCompetitionStandingsServer } from "@/app/_libs/football/standings";

interface Props {
  params: {
    id: string;
    code: string;
    type: string;
  };
}
export default async function LeaguesPage({ params }: Props) {
  const { code } = await params;
  const res = await getCompetitionStandingsServer(code);

  return (
    <div className={styles.leaguePage}>
      <LeagueHeader league={{ competition: res.competition, area: res.area }} />
      <LeagueTable standings={res.standings[0]} code={code} />
    </div>
  );
}
