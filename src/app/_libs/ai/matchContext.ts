import {
  getMatchOutcome,
  getRecentMatchesOfTeam,
  isFinishedMatch,
  isTeamMatch,
} from "@/app/_libs/_utils/match";
import {
  getMatchesRecentServer,
  getRecentWindowMatchesServer,
  getUpcomingWindowMatchesServer,
} from "@/app/_libs/football/matches";
import { getCompetitionStandingsServer } from "@/app/_libs/football/standings";
import { Match } from "@/app/_types/matches";
import { TableRow } from "@/app/_types/standings";
import { PreviewContext, TeamPreviewContext } from "./prompts";

/**
 * AI 기능(프리뷰·승부예측)이 공유하는 경기 조회와 프롬프트 컨텍스트 구성.
 * 모두 다른 화면이 이미 쓰는 URL 이라 AI 기능 때문에 football-data 요청이 늘지 않는다.
 */
export async function findMatch(matchId: number): Promise<Match | undefined> {
  const [upcoming, recent] = await Promise.all([
    getUpcomingWindowMatchesServer().catch(() => null),
    getRecentWindowMatchesServer().catch(() => null),
  ]);

  return [...(upcoming?.matches ?? []), ...(recent?.matches ?? [])].find(
    (match) => match.id === matchId,
  );
}

function toTeamContext(
  name: string,
  teamId: number,
  finished: Match[],
  standingByTeam: Map<number, TableRow>,
): TeamPreviewContext {
  const form = getRecentMatchesOfTeam(finished, teamId)
    .map((match) => getMatchOutcome(match, teamId))
    .filter((outcome): outcome is NonNullable<typeof outcome> => !!outcome);

  const row = standingByTeam.get(teamId);

  return {
    name,
    form,
    standing: row && {
      position: row.position,
      points: row.points,
      playedGames: row.playedGames,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
    },
  };
}

export async function buildMatchContext(match: Match): Promise<PreviewContext> {
  const code = match.competition.code;

  // 리그 페이지가 쓰는 것과 같은 URL 이라 대부분 ISR 캐시에서 바로 온다.
  const [standingsRes, finishedRes] = await Promise.all([
    getCompetitionStandingsServer(code).catch(() => null),
    getMatchesRecentServer(code).catch(() => null),
  ]);

  const table = standingsRes?.standings.at(0)?.table ?? [];
  const standingByTeam = new Map(table.map((row) => [row.team.id, row]));

  const finished = (finishedRes?.matches ?? []).filter((item) =>
    isFinishedMatch(item.status),
  );

  const headToHead = finished
    .filter(
      (item) =>
        isTeamMatch(item, match.homeTeam.id) &&
        isTeamMatch(item, match.awayTeam.id),
    )
    .slice(-3)
    .map(
      (item) =>
        `${item.homeTeam.shortName} ${item.score.fullTime.home ?? 0}-${item.score.fullTime.away ?? 0} ${item.awayTeam.shortName}`,
    );

  return {
    competitionName: match.competition.name,
    kickOffUtc: match.utcDate,
    home: toTeamContext(
      match.homeTeam.name,
      match.homeTeam.id,
      finished,
      standingByTeam,
    ),
    away: toTeamContext(
      match.awayTeam.name,
      match.awayTeam.id,
      finished,
      standingByTeam,
    ),
    headToHead,
  };
}
