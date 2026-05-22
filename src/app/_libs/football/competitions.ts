import { CompetitionsResponse } from "@/app/_types/competitions.js";
import { footballServerFetch } from "./footballServerFetch.ts";
import { CompetitionMatchesResponse } from "@/app/_types/matches.js";

export function getCompetitionsServer() {
  return footballServerFetch<CompetitionsResponse>("/competitions", {
    revalidate: 60 * 60 * 24,
  });
}
export function getCompetitionLiveMatches(code: string) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=LIVE`,

    {
      revalidate: 60 * 60,
    },
  );
}
