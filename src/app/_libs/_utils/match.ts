import { Match } from "@/app/_types/matches";
import { MatchStatus } from "@/app/_types/common";
import { LeagueMatches } from "@/app/_types/todayMatches";

export type MatchOutcome = "W" | "D" | "L";

const LIVE_STATUSES: MatchStatus[] = ["IN_PLAY", "PAUSED"];

export function isLiveMatch(status: MatchStatus) {
  return LIVE_STATUSES.includes(status);
}

export function isFinishedMatch(status: MatchStatus) {
  return status === "FINISHED" || status === "AWARDED";
}

export function isTeamMatch(match: Match, teamId: number) {
  return match.homeTeam.id === teamId || match.awayTeam.id === teamId;
}

/** 해당 팀 기준의 승/무/패. 아직 결과가 없으면 null. */
export function getMatchOutcome(
  match: Match,
  teamId: number,
): MatchOutcome | null {
  const { winner } = match.score;

  if (!winner) return null;
  if (winner === "DRAW") return "D";
  if (!isTeamMatch(match, teamId)) return null;

  const isHome = match.homeTeam.id === teamId;

  return (isHome && winner === "HOME_TEAM") || (!isHome && winner === "AWAY_TEAM")
    ? "W"
    : "L";
}

function byKickOffAsc(a: Match, b: Match) {
  return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
}

/** 팀의 최근 경기 N개(오래된 순 정렬 후 마지막 N개). */
export function getRecentMatchesOfTeam(
  matches: Match[],
  teamId: number,
  count = 5,
) {
  return matches
    .filter((match) => isTeamMatch(match, teamId))
    .sort(byKickOffAsc)
    .slice(-count);
}

/** 팀의 가장 빠른 예정 경기. */
export function getNextMatchOfTeam(matches: Match[], teamId: number) {
  return matches
    .filter((match) => isTeamMatch(match, teamId))
    .sort(byKickOffAsc)
    .at(0);
}

interface LeagueInfo {
  code: string;
  name: string;
}

/**
 * 단일 /v4/matches 응답을 리그별로 묶는다.
 * 전달된 리그 순서를 그대로 유지하고, 목록에 없는 대회는 버린다.
 */
export function groupMatchesByLeague(
  matches: Match[],
  leagues: readonly LeagueInfo[],
): LeagueMatches[] {
  const grouped = new Map<string, Match[]>(
    leagues.map((league) => [league.code, []]),
  );

  for (const match of matches) {
    grouped.get(match.competition?.code)?.push(match);
  }

  return leagues.map((league) => {
    // 여러 대회가 섞여 오므로 리그 안에서 킥오프 순으로 다시 정렬한다.
    const leagueMatches = (grouped.get(league.code) ?? []).sort(byKickOffAsc);
    const competition = leagueMatches.at(0)?.competition;

    return {
      code: league.code,
      name: competition?.name ?? league.name,
      emblem: competition?.emblem,
      matches: leagueMatches,
    };
  });
}

/** 폴링을 멈춰도 되는 상태 — 더 이상 스코어가 변하지 않는다. */
const SETTLED_STATUSES: MatchStatus[] = [
  "FINISHED",
  "AWARDED",
  "POSTPONED",
  "CANCELLED",
];

export function collectMatches(leagues: LeagueMatches[] = []) {
  return leagues.flatMap((league) => league.matches);
}

/**
 * 진행 중(IN_PLAY / PAUSED) 경기가 하나라도 있을 때만 참.
 * 전 경기가 종료·연기·취소면 갱신할 것이 없으므로 거짓.
 */
export function hasUpdatingMatch(matches: Match[]) {
  if (matches.length === 0) return false;
  if (matches.every((match) => SETTLED_STATUSES.includes(match.status))) {
    return false;
  }

  return matches.some((match) => isLiveMatch(match.status));
}

function scoreKey(match: Match) {
  return `${match.score.fullTime.home ?? ""}-${match.score.fullTime.away ?? ""}`;
}

/** 이전 응답 대비 스코어가 바뀐 경기 id. 바뀐 행만 강조하기 위해 쓴다. */
export function getScoreChangedMatchIds(
  previous: LeagueMatches[],
  next: LeagueMatches[],
): number[] {
  const previousScores = new Map(
    collectMatches(previous).map((match) => [match.id, scoreKey(match)]),
  );

  return collectMatches(next)
    .filter((match) => {
      const before = previousScores.get(match.id);
      return before !== undefined && before !== scoreKey(match);
    })
    .map((match) => match.id);
}

const SCORE_VISIBLE_STATUSES: MatchStatus[] = [
  "IN_PLAY",
  "PAUSED",
  "FINISHED",
  "AWARDED",
];

export function isScoreVisible(status: MatchStatus) {
  return SCORE_VISIBLE_STATUSES.includes(status);
}

/**
 * 경기 상태 배지 문구. 킥오프 시간을 그대로 보여줘야 하는 상태는 null.
 * 무료 플랜은 진행 시간(minute)을 주지 않으므로 전/후반 구분까지만 표기한다.
 */
export function getMatchStatusLabel(status: MatchStatus): string | null {
  switch (status) {
    case "IN_PLAY":
      return "진행 중";
    case "PAUSED":
      return "HT";
    case "FINISHED":
    case "AWARDED":
      return "FT";
    case "POSTPONED":
      return "연기";
    case "SUSPENDED":
      return "중단";
    case "CANCELLED":
      return "취소";
    default:
      return null;
  }
}

/** 즐겨찾기 팀이 참여한 경기만 추린다. 서버 요청을 늘리지 않고 화면만 개인화한다. */
export function getMatchesOfTeams(
  leagues: LeagueMatches[],
  teamIds: number[],
): Match[] {
  if (teamIds.length === 0) return [];

  const wanted = new Set(teamIds);

  return collectMatches(leagues)
    .filter(
      (match) => wanted.has(match.homeTeam.id) || wanted.has(match.awayTeam.id),
    )
    .sort(byKickOffAsc);
}

/** 즐겨찾기 리그를 앞으로 보낸다. 그 외 순서는 그대로 유지한다. */
export function sortLeaguesByFavorite(
  leagues: LeagueMatches[],
  favoriteCodes: string[],
): LeagueMatches[] {
  if (favoriteCodes.length === 0) return leagues;

  const favorites = new Set(favoriteCodes);

  return [...leagues].sort((a, b) => {
    const aFavorite = favorites.has(a.code) ? 0 : 1;
    const bFavorite = favorites.has(b.code) ? 0 : 1;

    return aFavorite - bFavorite;
  });
}
