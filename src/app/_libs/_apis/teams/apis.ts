import { TeamMatchesResponse } from "@/app/_types/teams";
import axiosInstance from "../../_utils/axiosInstance";

const RECENT_MATCH_LIMIT = 5;

function getTeamMatches(teamId: number, code: string, status: string) {
  return axiosInstance
    .get<TeamMatchesResponse>(`/teams/${teamId}/matches`, {
      params: { status, competitions: code, limit: RECENT_MATCH_LIMIT },
    })
    .then((res) => res.data);
}

export function getTeamRecentMatches(teamId: number, code: string) {
  return getTeamMatches(teamId, code, "FINISHED");
}

export function getTeamScheduledMatches(teamId: number, code: string) {
  return getTeamMatches(teamId, code, "SCHEDULED");
}
