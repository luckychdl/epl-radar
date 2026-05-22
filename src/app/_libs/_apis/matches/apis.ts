import { format, parse } from "date-fns";
import { SUPPORTED_LEAGUES } from "@/app/_constants/leagues";
import { LeagueMatches } from "@/app/_types/todayMatches";

const BASE_URL = "https://api.football-data.org/v4";

async function getCompetitionMatches(
  code: string,

  date: string,
): Promise<LeagueMatches> {
  const leagueInfo = SUPPORTED_LEAGUES.find((league) => league.code === code);

  const res = await fetch(
    `${BASE_URL}/competitions/${code}/matches?dateFrom=${date}&dateTo=${date}`,

    {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY!,
      },

      next: {
        revalidate: 60,
      },
    },
  );

  if (!res.ok) {
    return {
      code,

      name: leagueInfo?.name ?? code,

      emblem: undefined,

      matches: [],
    };
  }

  const data = await res.json();
  console.log(data, "data");
  return {
    code,

    name: data.competition?.name ?? leagueInfo?.name ?? code,

    emblem: data.competition?.emblem,

    matches: data.matches ?? [],
  };
}

export async function getTodayMatchesServer(date?: string | null) {
  const targetDate = date
    ? format(parse(date, "yyyyMMdd", new Date()), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");
  console.log(targetDate, "targetDate");
  const results = await Promise.all(
    SUPPORTED_LEAGUES.map((league) =>
      getCompetitionMatches(league.code, targetDate),
    ),
  );

  return {
    date: targetDate,
    leagues: results,
  };
}
