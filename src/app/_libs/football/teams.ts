import { REVALIDATE } from "@/app/_constants/football";
import { TeamDetailResponse } from "@/app/_types/teamDetail";
import { footballServerFetch } from "./footballServerFetch";

export function getTeamInfoServer(teamId: string) {
  return footballServerFetch<TeamDetailResponse>(`/teams/${teamId}`, {
    revalidate: REVALIDATE.standard,
  });
}
