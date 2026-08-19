import { REVALIDATE } from "@/app/_constants/football";
import { CompetitionStandingsResponse } from "@/app/_types/standings";
import { footballServerFetch } from "./footballServerFetch";

/** season 은 시즌 시작 연도. 생략하면 진행 중인 시즌이다. */
export function getCompetitionStandingsServer(code: string, season?: number) {
  return footballServerFetch<CompetitionStandingsResponse>(
    `/competitions/${code}/standings` + (season ? `?season=${season}` : ""),
    { revalidate: REVALIDATE.standard },
  );
}
