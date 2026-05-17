import axiosInstance from "../../_uitils/axiosInstance";
import { TeamMatchesResponse } from "@/app/_types/teams";

export async function getTeamRecentMatches(teamId: number, code: string) {
  const res = await axiosInstance.get<TeamMatchesResponse>(
    `/teams/${teamId}/matches?status=FINISHED&competitions=${code}&limit=5`,
  );

  return { ...res.data };
}
export async function getTeamScheduledMatches(teamId: number, code: string) {
  const res = await axiosInstance.get<TeamMatchesResponse>(
    `/teams/${teamId}/matches?status=SCHEDULED&competitions=${code}&limit=5`,
  );

  return { ...res.data };
}
