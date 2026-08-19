import { createServer } from "node:http";

/**
 * E2E 전용 football-data 목 서버.
 * FOOTBALL_API_BASE_URL 로 이 서버를 가리켜 실제 분당 한도를 쓰지 않는다.
 */
const PORT = Number(process.env.MOCK_PORT ?? 4010);

const LEAGUES = [
  ["PL", 2021, "Premier League"],
  ["PD", 2014, "Primera Division"],
  ["SA", 2019, "Serie A"],
  ["BL1", 2002, "Bundesliga"],
  ["FL1", 2015, "Ligue 1"],
  ["CL", 2001, "UEFA Champions League"],
  ["EC", 2018, "European Championship"],
  ["WC", 2000, "FIFA World Cup"],
];

const AREA = { id: 2072, name: "England", code: "ENG", flag: null };

const team = (id, name, shortName, tla) => ({
  id,
  name,
  shortName,
  tla,
  crest: `https://crests.football-data.org/${id}.png`,
});

const TEAMS = {
  57: team(57, "Arsenal FC", "Arsenal", "ARS"),
  61: team(61, "Chelsea FC", "Chelsea", "CHE"),
  65: team(65, "Manchester City FC", "Man City", "MCI"),
  66: team(66, "Manchester United FC", "Man United", "MUN"),
};

const competition = (code) => {
  const [, id, name] = LEAGUES.find(([leagueCode]) => leagueCode === code) ?? LEAGUES[0];

  return {
    id,
    name,
    code,
    type: "LEAGUE",
    emblem: `https://crests.football-data.org/${code}.png`,
  };
};

const match = ({
  id,
  home,
  away,
  homeGoals = null,
  awayGoals = null,
  status = "TIMED",
  matchday = 1,
  utcDate = "2026-08-19T14:00:00Z",
  code = "PL",
}) => ({
  id,
  utcDate,
  status,
  matchday,
  stage: "REGULAR_SEASON",
  group: null,
  lastUpdated: "2026-08-19T10:00:00Z",
  area: AREA,
  competition: competition(code),
  homeTeam: TEAMS[home],
  awayTeam: TEAMS[away],
  score: {
    winner:
      homeGoals === null || awayGoals === null
        ? null
        : homeGoals > awayGoals
          ? "HOME_TEAM"
          : homeGoals < awayGoals
            ? "AWAY_TEAM"
            : "DRAW",
    fullTime: { home: homeGoals, away: awayGoals },
    halfTime: { home: null, away: null },
  },
});

const FINISHED_MATCHES = [
  match({ id: 101, home: 57, away: 61, homeGoals: 2, awayGoals: 1, status: "FINISHED", matchday: 1, utcDate: "2026-08-08T14:00:00Z" }),
  match({ id: 102, home: 65, away: 66, homeGoals: 1, awayGoals: 1, status: "FINISHED", matchday: 1, utcDate: "2026-08-08T16:00:00Z" }),
  match({ id: 103, home: 61, away: 65, homeGoals: 0, awayGoals: 3, status: "FINISHED", matchday: 2, utcDate: "2026-08-15T14:00:00Z" }),
  match({ id: 104, home: 66, away: 57, homeGoals: 1, awayGoals: 2, status: "FINISHED", matchday: 2, utcDate: "2026-08-15T16:00:00Z" }),
];

const SCHEDULED_MATCHES = [
  match({ id: 201, home: 57, away: 65, matchday: 3, utcDate: "2026-08-22T14:00:00Z" }),
  match({ id: 202, home: 66, away: 61, matchday: 3, utcDate: "2026-08-22T16:00:00Z" }),
];

const TODAY_MATCHES = [
  match({ id: 301, home: 57, away: 66, homeGoals: 1, awayGoals: 0, status: "FINISHED", matchday: 3, utcDate: "2026-08-19T14:00:00Z" }),
];

const SQUAD = [
  { id: 9001, name: "Aaron Keeper", position: "Goalkeeper", dateOfBirth: "1995-03-01" },
  { id: 9002, name: "Ben Back", position: "Defence", dateOfBirth: "1998-07-12" },
  { id: 9003, name: "Cal Mid", position: "Midfield", dateOfBirth: "2001-01-20" },
  { id: 9004, name: "Dan Front", position: "Offence", dateOfBirth: "2003-11-05" },
  { id: 9005, name: "Eli Utility", position: "Left Winger", dateOfBirth: "2000-05-30" },
].map((player) => ({ ...player, nationality: "England" }));

const SCORERS = [
  { player: 9004, team: 57, goals: 12, assists: 4, penalties: 2, playedMatches: 3 },
  { player: 9104, team: 65, goals: 9, assists: 1, penalties: 0, playedMatches: 3 },
  { player: 9003, team: 57, goals: 3, assists: null, penalties: null, playedMatches: 3 },
].map((row) => ({
  player: {
    id: row.player,
    name: `Player ${row.player}`,
    firstName: null,
    lastName: null,
    dateOfBirth: "2000-01-01",
    nationality: "England",
    section: "Offence",
    position: null,
    shirtNumber: null,
  },
  team: TEAMS[row.team],
  playedMatches: row.playedMatches,
  goals: row.goals,
  assists: row.assists,
  penalties: row.penalties,
}));

const SEASONS = [
  { id: 1, startDate: "2026-08-08", endDate: "2027-05-20", currentMatchday: 3, winner: null },
  { id: 2, startDate: "2025-08-15", endDate: "2026-05-24", currentMatchday: 38, winner: null },
];

const STANDINGS_TABLE = [
  { id: 57, points: 6, won: 2, draw: 0, lost: 0, goalsFor: 4, goalsAgainst: 2 },
  { id: 65, points: 4, won: 1, draw: 1, lost: 0, goalsFor: 4, goalsAgainst: 2 },
  { id: 66, points: 1, won: 0, draw: 1, lost: 1, goalsFor: 2, goalsAgainst: 3 },
  { id: 61, points: 0, won: 0, draw: 0, lost: 2, goalsFor: 1, goalsAgainst: 5 },
].map((row, index) => ({
  position: index + 1,
  team: TEAMS[row.id],
  playedGames: row.won + row.draw + row.lost,
  form: null,
  won: row.won,
  draw: row.draw,
  lost: row.lost,
  points: row.points,
  goalsFor: row.goalsFor,
  goalsAgainst: row.goalsAgainst,
  goalDifference: row.goalsFor - row.goalsAgainst,
}));

function resolve(pathname, searchParams) {
  if (pathname === "/competitions") {
    const competitions = LEAGUES.map(([code, id, name]) => ({
      id,
      name,
      code,
      type: "LEAGUE",
      emblem: `https://crests.football-data.org/${code}.png`,
      plan: "TIER_ONE",
      area: AREA,
    }));

    return { count: competitions.length, competitions };
  }

  if (pathname === "/matches") {
    const wide = searchParams.get("dateTo") !== searchParams.get("dateFrom");
    const matches = wide
      ? [...FINISHED_MATCHES, ...TODAY_MATCHES, ...SCHEDULED_MATCHES]
      : TODAY_MATCHES;

    return { filters: {}, resultSet: { count: matches.length }, matches };
  }

  const competitionDetail = pathname.match(/^\/competitions\/([A-Z0-9]+)$/);
  if (competitionDetail) {
    return {
      ...competition(competitionDetail[1]),
      area: AREA,
      currentSeason: SEASONS[0],
      seasons: SEASONS,
    };
  }

  const standingsMatch = pathname.match(/^\/competitions\/([A-Z0-9]+)\/standings$/);
  if (standingsMatch) {
    return {
      area: AREA,
      competition: competition(standingsMatch[1]),
      season: {
        id: 1,
        startDate: "2026-08-08",
        endDate: "2027-05-20",
        currentMatchday: 3,
        winner: null,
      },
      standings: [
        { stage: "REGULAR_SEASON", type: "TOTAL", group: null, table: STANDINGS_TABLE },
      ],
    };
  }

  const scorersMatch = pathname.match(/^\/competitions\/([A-Z0-9]+)\/scorers$/);
  if (scorersMatch) {
    // 시즌 파라미터가 붙어야만 기록을 내려준다. 직전 시즌 폴백 경로를 재현한다.
    const season = searchParams.get("season");
    const scorers = season ? SCORERS : [];

    return {
      count: scorers.length,
      filters: { season: season ?? undefined },
      competition: competition(scorersMatch[1]),
      season: season
        ? { id: 2, startDate: "2025-08-15", endDate: "2026-05-24", currentMatchday: 38, winner: null }
        : { id: 1, startDate: "2026-08-08", endDate: "2027-05-20", currentMatchday: 3, winner: null },
      scorers,
    };
  }

  const competitionMatches = pathname.match(/^\/competitions\/([A-Z0-9]+)\/matches$/);
  if (competitionMatches) {
    const status = searchParams.get("status");
    const matches =
      status === "SCHEDULED"
        ? SCHEDULED_MATCHES
        : status === "FINISHED"
          ? FINISHED_MATCHES
          : [...FINISHED_MATCHES, ...SCHEDULED_MATCHES];

    return {
      filters: { status: status ?? undefined },
      resultSet: { count: matches.length },
      competition: competition(competitionMatches[1]),
      matches,
    };
  }

  const teamMatch = pathname.match(/^\/teams\/(\d+)$/);
  if (teamMatch) {
    const found = TEAMS[Number(teamMatch[1])];
    if (!found) return null;

    return {
      ...found,
      area: AREA,
      address: "London",
      website: "https://example.com",
      founded: 1886,
      clubColors: "Red / White",
      venue: "Emirates Stadium",
      runningCompetitions: [competition("PL")],
      coach: {
        id: 1,
        firstName: null,
        lastName: null,
        name: "Coach",
        dateOfBirth: "1980-01-01",
        nationality: "England",
      },
      squad: SQUAD,
      lastUpdated: "2026-08-19T10:00:00Z",
    };
  }

  return null;
}

// 실제 API 처럼 잔여 요청 수를 내려줘 계측 화면 경로까지 검증한다.
let requestsAvailable = 10;

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${PORT}`);
  const body = resolve(url.pathname, url.searchParams);

  requestsAvailable = Math.max(0, requestsAvailable - 1);

  response.writeHead(body ? 200 : 404, {
    "Content-Type": "application/json",
    "X-RequestCounter-Reset": "60",
    "x-requests-available-minute": String(requestsAvailable),
  });
  response.end(JSON.stringify(body ?? { message: "Not found", errorCode: 404 }));
}).listen(PORT, () => {
  console.log(`[mock-football-api] listening on ${PORT}`);
});
