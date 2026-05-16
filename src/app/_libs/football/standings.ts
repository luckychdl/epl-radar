import { CompetitionStandingsResponse } from "@/app/_types/standings.js";
import { footballServerFetch } from "./footballServerFetch.ts";

export function getCompetitionStandingsServer(id: string) {
  return footballServerFetch<CompetitionStandingsResponse>(
    `/competitions/${id}/standings`,
    {
      revalidate: 60 * 60,
    },
  );
}
