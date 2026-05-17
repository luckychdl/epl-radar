import { footballServerFetch } from "./footballServerFetch.ts";
import { CompetitionMatchesResponse } from "@/app/_types/matches.js";

export function getMatchesRecentServer(code: string) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=FINISHED`,
    {
      revalidate: 60 * 60,
    },
  );
}
export function getMatchesScheduledServer(code: string) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=SCHEDULED`,
    {
      revalidate: 60 * 60,
    },
  );
}
