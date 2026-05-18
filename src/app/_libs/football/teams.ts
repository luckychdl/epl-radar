import { TeamDetailResponse } from "@/app/_types/teamDetail.js";
import { footballServerFetch } from "./footballServerFetch.ts";

export function getTeamInfoServer(teamId: string) {
  return footballServerFetch<TeamDetailResponse>(`/teams/${teamId}`, {
    revalidate: 60 * 60,
  });
}
