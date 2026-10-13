import { MatchStatus, MatchWinner } from "@/app/_types/common";
import { Match } from "@/app/_types/matches";

interface Options {
  id?: number;
  homeId: number;
  awayId: number;
  homeGoals?: number | null;
  awayGoals?: number | null;
  status?: MatchStatus;
  matchday?: number;
  utcDate?: string;
  code?: string;
}

function toWinner(
  home: number | null,
  away: number | null,
  status: MatchStatus,
): MatchWinner {
  if (home === null || away === null) return null;
  if (status !== "FINISHED" && status !== "AWARDED") return null;
  if (home > away) return "HOME_TEAM";
  if (home < away) return "AWAY_TEAM";

  return "DRAW";
}

/** 테스트용 최소 Match. 실제 응답 필드 중 계산에 쓰이는 것만 채운다. */
export function createMatch({
  id = 1,
  homeId,
  awayId,
  homeGoals = null,
  awayGoals = null,
  status = "FINISHED",
  matchday = 1,
  utcDate = "2026-08-19T12:00:00Z",
  code = "PL",
}: Options): Match {
  const team = (teamId: number) => ({
    id: teamId,
    name: `Team ${teamId}`,
    shortName: `T${teamId}`,
    tla: `T${teamId}`,
    crest: `https://crests.example/${teamId}.png`,
  });

  return {
    id,
    utcDate,
    status,
    matchday,
    area: { id: 1, name: "England", code: "ENG", flag: null },
    competition: {
      id: 2021,
      name: code,
      code,
      type: "LEAGUE",
      emblem: "https://crests.example/pl.png",
    },
    homeTeam: team(homeId),
    awayTeam: team(awayId),
    score: {
      winner: toWinner(homeGoals, awayGoals, status),
      fullTime: { home: homeGoals, away: awayGoals },
    },
  };
}
