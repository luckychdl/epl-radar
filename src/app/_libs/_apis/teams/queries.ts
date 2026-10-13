import { useQuery } from "@tanstack/react-query";
import { getTeamRecentMatches, getTeamScheduledMatches } from "./apis";

const ONE_HOUR = 1000 * 60 * 60;

export function useTeamRecentMatches(teamId: number, code: string) {
  return useQuery({
    // code 가 키에 빠져 있으면 리그를 바꿔도 이전 리그 캐시가 재사용된다.
    queryKey: ["teamMatches", "recent", teamId, code],
    queryFn: () => getTeamRecentMatches(teamId, code),
    enabled: !!teamId && !!code,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
    retry: false,
  });
}

export function useTeamScheduledMatches(teamId: number, code: string) {
  return useQuery({
    queryKey: ["teamMatches", "scheduled", teamId, code],
    queryFn: () => getTeamScheduledMatches(teamId, code),
    enabled: !!teamId && !!code,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR,
    retry: false,
  });
}
