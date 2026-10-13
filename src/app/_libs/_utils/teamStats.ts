import { Match } from "@/app/_types/matches";
import { TableRow } from "@/app/_types/standings";
import { isFinishedMatch } from "./match";

export interface TeamRecord {
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface HomeAwaySplit {
  home: TeamRecord;
  away: TeamRecord;
}

function emptyRecord(): TeamRecord {
  return { played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
}

/** 팀 기준 득점/실점. 그 팀 경기가 아니거나 결과가 없으면 null. */
function toTeamScore(match: Match, teamId: number) {
  if (!isFinishedMatch(match.status)) return null;

  const { home: homeGoals, away: awayGoals } = match.score.fullTime;
  if (homeGoals === null || awayGoals === null) return null;

  const isHome = match.homeTeam.id === teamId;
  const isAway = match.awayTeam.id === teamId;
  if (!isHome && !isAway) return null;

  return {
    isHome,
    scored: isHome ? homeGoals : awayGoals,
    conceded: isHome ? awayGoals : homeGoals,
  };
}

function accumulate(record: TeamRecord, scored: number, conceded: number) {
  record.played += 1;
  record.goalsFor += scored;
  record.goalsAgainst += conceded;

  if (scored > conceded) record.won += 1;
  else if (scored < conceded) record.lost += 1;
  else record.draw += 1;
}

/** 넘겨받은 경기들의 팀 기준 전적. 종료된 경기만 센다. */
export function getTeamRecord(matches: Match[], teamId: number): TeamRecord {
  const record = emptyRecord();

  for (const match of matches) {
    const score = toTeamScore(match, teamId);
    if (score) accumulate(record, score.scored, score.conceded);
  }

  return record;
}

export function getRecordPoints(record: TeamRecord): number {
  return record.won * 3 + record.draw;
}

/**
 * 홈/원정 성적. 무료 플랜 순위표는 합계만 주므로 종료 경기에서 직접 집계한다.
 * 추가 요청 없이 이미 받아둔 리그 경기 목록만 쓴다.
 */
export function getHomeAwaySplit(
  matches: Match[],
  teamId: number,
): HomeAwaySplit {
  const split: HomeAwaySplit = { home: emptyRecord(), away: emptyRecord() };

  for (const match of matches) {
    const score = toTeamScore(match, teamId);
    if (!score) continue;

    accumulate(
      score.isHome ? split.home : split.away,
      score.scored,
      score.conceded,
    );
  }

  return split;
}

export interface SeasonAverages {
  pointsPerGame: number;
  goalsForPerGame: number;
  goalsAgainstPerGame: number;
  /** 0~1 */
  winRate: number;
}

/** 경기당 지표. 아직 한 경기도 안 치렀으면 null. */
export function getSeasonAverages(row: TableRow): SeasonAverages | null {
  if (row.playedGames <= 0) return null;

  return {
    pointsPerGame: row.points / row.playedGames,
    goalsForPerGame: row.goalsFor / row.playedGames,
    goalsAgainstPerGame: row.goalsAgainst / row.playedGames,
    winRate: row.won / row.playedGames,
  };
}
