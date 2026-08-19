import { notFound } from "next/navigation";
import ErrorNotice from "@/app/_components/_commons/ErrorNotice/ErrorNotice";
import NextMatchForm from "@/app/_components/_widgets/teams/NextMatchForm/NextMatchForm";
import RecentMatchesForm from "@/app/_components/_widgets/teams/RecentMatchesForm/RecentMatchesForm";
import RemainingDifficulty from "@/app/_components/_widgets/teams/RemainingDifficulty/RemainingDifficulty";
import TeamDetailHeader from "@/app/_components/_widgets/teams/TeamDetailHeader/TeamDetailHeader";
import TeamInfo from "@/app/_components/_widgets/teams/TeamInfo/TeamInfo";
import TeamMatchList from "@/app/_components/_widgets/teams/TeamMatchList/TeamMatchList";
import TeamSquad from "@/app/_components/_widgets/teams/TeamSquad/TeamSquad";
import TeamStats from "@/app/_components/_widgets/teams/TeamStats/TeamStats";
import { isTeamTabType } from "@/app/_constants/teams";
import {
  getMatchesRecentServer,
  getMatchesScheduledServer,
} from "@/app/_libs/football/matches";
import { getCompetitionScorersServer } from "@/app/_libs/football/scorers";
import { getCompetitionStandingsServer } from "@/app/_libs/football/standings";
import { getTeamInfoServer } from "@/app/_libs/football/teams";
import styles from "./TeamDetail.module.scss";

interface Props {
  params: Promise<{ id: string; code: string; type: string }>;
}

export default async function TeamDetail({ params }: Props) {
  const { id, code, type } = await params;

  if (!/^\d+$/.test(id)) notFound();
  if (!isTeamTabType(type)) notFound();

  // 네 요청은 탭과 무관하게 공통이고, 득점 순위는 Stats 탭에서만 추가로 쓴다.
  // 다른 탭을 열 때 쓰지도 않을 요청으로 분당 예산을 태우지 않는다.
  const [team, recent, scheduled, standings, scorers] = await Promise.all([
    getTeamInfoServer(id).catch(() => null),
    getMatchesRecentServer(code).catch(() => null),
    getMatchesScheduledServer(code).catch(() => null),
    getCompetitionStandingsServer(code).catch(() => null),
    type === "stats"
      ? getCompetitionScorersServer(code).catch(() => null)
      : null,
  ]);

  if (!team) return <ErrorNotice />;

  const teamId = Number(id);
  const recentMatches = recent?.matches ?? [];
  const scheduledMatches = scheduled?.matches ?? [];
  const table = standings?.standings.at(0)?.table ?? [];

  return (
    <div className={styles.teamDetail}>
      <TeamDetailHeader team={team} id={id} code={code} type={type} />

      {type === "overview" && (
        <>
          <div className={styles.matchSection}>
            <RecentMatchesForm recent={recentMatches} teamId={teamId} />
            <NextMatchForm scheduled={scheduledMatches} teamId={teamId} />
          </div>
          <RemainingDifficulty
            scheduled={scheduledMatches}
            teamId={teamId}
            table={table}
          />
          <TeamInfo team={team} />
        </>
      )}

      {type === "matches" && (
        <TeamMatchList
          recent={recentMatches}
          scheduled={scheduledMatches}
          teamId={teamId}
        />
      )}

      {type === "squad" && <TeamSquad squad={team.squad ?? []} />}

      {type === "stats" && (
        <TeamStats
          row={table.find((item) => item.team.id === teamId)}
          recent={recentMatches}
          teamId={teamId}
          scorers={scorers}
        />
      )}
    </div>
  );
}
