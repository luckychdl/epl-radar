import MyTeamsList from "../_components/_widgets/teams/MyTeamsList/MyTeamsList";
import {
  getRecentWindowMatchesServer,
  getUpcomingWindowMatchesServer,
} from "../_libs/football/matches";
import styles from "./myTeams.module.scss";

export const metadata = { title: "My Teams | EPL Radar" };

export default async function MyTeamsPage() {
  // 즐겨찾기는 클라이언트에만 있으므로 서버는 전체 데이터 한 벌만 받는다.
  // 팀별로 나눠 부르면 즐겨찾기를 늘릴수록 분당 한도를 잡아먹는다.
  const [recent, upcoming] = await Promise.all([
    getRecentWindowMatchesServer().catch(() => null),
    getUpcomingWindowMatchesServer().catch(() => null),
  ]);

  return (
    <div className={styles.myTeams}>
      <h2>My Teams</h2>
      <MyTeamsList
        recentMatches={recent?.matches ?? []}
        upcomingMatches={upcoming?.matches ?? []}
      />
    </div>
  );
}
