import { REVALIDATE } from "@/app/_constants/football";
import {
  CompetitionDetailResponse,
  CompetitionsResponse,
} from "@/app/_types/competitions";
import { CompetitionMatchesResponse } from "@/app/_types/matches";
import { footballServerFetch } from "./footballServerFetch";

export function getCompetitionsServer() {
  return footballServerFetch<CompetitionsResponse>("/competitions", {
    revalidate: REVALIDATE.static,
  });
}

/** 시즌 목록은 시즌 중에 바뀌지 않으므로 하루 캐시로 충분하다. */
export function getCompetitionDetailServer(code: string) {
  return footballServerFetch<CompetitionDetailResponse>(
    `/competitions/${code}`,
    { revalidate: REVALIDATE.static },
  );
}

export function getCompetitionLiveMatches(code: string) {
  return footballServerFetch<CompetitionMatchesResponse>(
    `/competitions/${code}/matches?status=LIVE`,
    { revalidate: REVALIDATE.live },
  );
}
