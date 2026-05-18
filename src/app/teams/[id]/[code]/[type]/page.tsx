import RecentMatchesForm from "@/app/_components/_widgets/teams/RecentMatchesForm/RecentMatchesForm";
import TeamDetailHeader from "@/app/_components/_widgets/teams/TeamDetailHeader/TeamDetailHeader";
import {
  getMatchesRecentServer,
  getMatchesScheduledServer,
} from "@/app/_libs/football/matches";
import { getTeamInfoServer } from "@/app/_libs/football/teams";
import styles from "./TeamDetail.module.scss";
import NextMatchForm from "@/app/_components/_widgets/teams/NextMatchForm/NextMatchForm";
interface Props {
  params: {
    id: string;
    code: string;
    type: string;
  };
}
export default async function TeamDetail({ params }: Props) {
  const { id, code } = await params;

  const recent = await getMatchesRecentServer(code);
  const scheduled = await getMatchesScheduledServer(code);
  const team = await getTeamInfoServer(id);
  console.log(team, "team");
  return (
    <main className={styles.teamDetail}>
      <TeamDetailHeader team={team} />
      <div className={styles.matchSection}>
        <RecentMatchesForm recent={recent.matches} id={id} />
        <NextMatchForm match={scheduled.matches} id={id} />
      </div>
    </main>
  );
}
